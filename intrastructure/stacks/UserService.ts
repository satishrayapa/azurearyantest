import { Construct } from '@aws-cdk/core';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';
import { Lambda } from '../cdk/Lambda';

export class UserService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/users/';
  readonly endpoint = '/me';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'user-service-stack');

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        file: 'get.ts',
        name: 'get-profile',
        databaseAccess: { read: [table] },
      }),
    });

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.POST,
      handler: new Lambda(this, {
        role,
        type,
        file: 'update-profile.ts',
        name: 'update-profile',
        databaseAccess: { readWrite: [table] },
      }),
    });
  }
}
