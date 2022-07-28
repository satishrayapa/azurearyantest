import { Construct } from '@aws-cdk/core';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Lambda } from '../cdk/Lambda';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';
export class EventService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/events/';
  readonly endpoint = '/events';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'event-service-stack');

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'list-events',
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
        name: 'get-event',
        file: 'get.ts',
        databaseAccess: { read: [table] },
      }),
    });
  }
}
