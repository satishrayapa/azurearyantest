import { Construct, Duration } from '@aws-cdk/core';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Lambda } from '../cdk/Lambda';
import { BaseConstruct, ConstructProps } from '../cdk/BaseConstruct';

export class AppNotificationService extends Construct implements BaseConstruct {
  readonly baseFilePath = 'resources/endpoints/notifications/';
  readonly endpoint = '/notifications';

  constructor(props: ConstructProps) {
    super(props.scope, 'app-notification-service-stack');

    this.addEndpoints(props);
    this.addTrigger(props);
  }

  public addEndpoints({ api, notificationTable, role, type }: ConstructProps) {
    const databaseAccess = { readWrite: [notificationTable] };

    api.addLambdaRoute({
      method: HttpMethod.GET,
      path: this.endpoint,
      handler: new Lambda(this, {
        role,
        type,
        file: 'list.ts',
        name: 'list-notifications',
        databaseAccess,
      }),
    });

    api.addLambdaRoute({
      method: HttpMethod.POST,
      path: `${this.endpoint}/read/{id}`,
      handler: new Lambda(this, {
        role,
        type,
        file: 'read.ts',
        name: 'read-notification',
        databaseAccess,
      }),
    });

    api.addLambdaRoute({
      method: HttpMethod.POST,
      path: `${this.endpoint}/read`,
      handler: new Lambda(this, {
        role,
        type,
        file: 'read-all.ts',
        name: 'read-all-notifications',
        timeout: Duration.minutes(1),
        databaseAccess,
      }),
    });

    api.addLambdaRoute({
      method: HttpMethod.DELETE,
      path: `${this.endpoint}/{id}`,
      handler: new Lambda(this, {
        role,
        type,
        file: 'delete.ts',
        name: 'delete-notification',
        databaseAccess,
      }),
    });

    api.addLambdaRoute({
      method: HttpMethod.DELETE,
      path: this.endpoint,
      handler: new Lambda(this, {
        role,
        type,
        file: 'delete-all.ts',
        name: 'delete-all-notifications',
        timeout: Duration.minutes(1),
        databaseAccess: { readWrite: [notificationTable] },
      }),
    });
  }

  public addTrigger({ table, notificationTable, role, type }: ConstructProps) {
    const triggerHandler = new Lambda(this, {
      role,
      type,
      file: 'resources/triggers/create-app-notifications.ts',
      name: 'create-app-notifications',
      dontAppendBasePath: true,
      databaseAccess: {
        fullAccess: [table, notificationTable],
      },
    });

    triggerHandler.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: StartingPosition.LATEST,
        batchSize: 10,
        bisectBatchOnError: true,
        retryAttempts: 10,
      })
    );
  }
}
