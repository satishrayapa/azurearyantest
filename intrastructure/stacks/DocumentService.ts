import { Construct, Duration } from '@aws-cdk/core';
import { Lambda } from '../cdk/Lambda';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';

export class DocumentService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/documents/';
  readonly endpoint = '/{module}/{entity}';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'document-service-stack');

    api.addLambdaRoute({
      path: `${this.endpoint}/{id}`,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'get-document',
        file: 'get.ts',
        databaseAccess: { read: [table] },
      }),
    });

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'list-documents',
        file: 'list.ts',
        databaseAccess: { read: [table] },
      }),
    });

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.POST,
      handler: new Lambda(this, {
        timeout: Duration.minutes(3),
        role,
        type,
        name: 'upsert-document',
        file: 'upsert.ts',
        databaseAccess: { write: [table] },
      }),
    });
  }
}
