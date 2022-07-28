import { Construct } from '@aws-cdk/core';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Lambda } from '../cdk/Lambda';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';

export class WidgetService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/widgets/';
  readonly endpoint = '/widgets/{module}';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'widget-service-stack');

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'list-widgets',
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
        name: 'filter-documents-by-widget',
        file: 'filter-documents.ts',
        databaseAccess: { read: [table] },
      }),
    });
  }
}
