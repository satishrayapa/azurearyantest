import { Construct } from '@aws-cdk/core';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Lambda } from '../cdk/Lambda';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';

export class OnboardingService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/onboarding/';
  readonly endpoint = '/onboarding';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'onboarding-service-stack');
    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      protected: false,
      handler: new Lambda(this, {
        role,
        type,
        name: 'list-onboarding',
        file: 'list.ts',
        databaseAccess: { read: [table] },
      }),
    });
  }
}
