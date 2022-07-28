import { Construct } from '@aws-cdk/core';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';
import { Lambda } from '../cdk/Lambda';

export class SurveyService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/surveys/';
  readonly endpoint = '/surveys';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'survey-service-stack');

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'list-surveys',
        file: 'list.ts',
        databaseAccess: { read: [table] },
      }),
    });

    api.addLambdaRoute({
      path: `${this.endpoint}/{id}`,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'get-survey',
        file: 'get.ts',
        databaseAccess: { read: [table] },
      }),
    });

    api.addLambdaRoute({
      path: `${this.endpoint}/{id}`,
      method: HttpMethod.POST,
      handler: new Lambda(this, {
        role,
        type,
        name: 'answer-survey',
        file: 'answer.ts',
        databaseAccess: { readWrite: [table] },
      }),
    });
  }
}
