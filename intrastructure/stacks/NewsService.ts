import { Construct } from '@aws-cdk/core';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';
import { Lambda } from '../cdk/Lambda';

export class NewsService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/news/';
  readonly endpoint = '/news';

  constructor({ scope, api, table, role, type }: ConstructProps) {
    super(scope, 'news-service-stack');

    api.addLambdaRoute({
      path: this.endpoint,
      method: HttpMethod.GET,
      handler: new Lambda(this, {
        role,
        type,
        name: 'list-news',
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
        name: 'get-news',
        file: 'get.ts',
        databaseAccess: { read: [table] },
      }),
    });
  }
}
