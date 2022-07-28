import {  Construct } from '@aws-cdk/core';
import { Lambda } from '../cdk/Lambda';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';
export class AuthService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/auth/';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'auth-service-stack');

    const defaultConfig = {
      role,
      type,
      environment: {
        authServiceUrl: process.env.AUTH_SERVICE_URL,
        authServicePeapodUrl: process.env.AUTH_SERVICE_PEAPOD_URL,
        authServiceBasicKey: process.env.AUTH_SERVICE_BASIC_KEY,
        peapodClientIds: process.env.PEAPOD_CLIENT_IDS,
      },
    };

    api.addLambdaRoute({
      path: '/login',
      method: HttpMethod.POST,
      protected: false,
      handler: new Lambda(this, {
        ...defaultConfig,
        file: 'login.ts',
        name: 'login',
        databaseAccess: { readWrite: [table] },
      }),
    });

    api.addLambdaRoute({
      path: '/logout',
      method: HttpMethod.POST,
      handler: new Lambda(this, {
        ...defaultConfig,
        file: 'logout.ts',
        name: 'logout',
        databaseAccess: { readWrite: [table] },
      }),
    });

    api.addLambdaRoute({
      path: '/auth/refresh',
      method: HttpMethod.POST,
      protected: false,
      handler: new Lambda(this, {
        ...defaultConfig,
        file: 'refresh-token.ts',
        name: 'refresh-token',
      }),
    });
  }
}
