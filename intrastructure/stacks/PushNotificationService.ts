import { Construct } from '@aws-cdk/core';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { ConstructProps } from '../cdk/BaseConstruct';
import { Lambda } from '../cdk/Lambda';

export class PushNotificationService extends Construct {
  constructor({ scope, table, role, type }: ConstructProps) {
    super(scope, 'push-notification-service-stack');

    const triggerHandler = new Lambda(this, {
      role,
      type,
      file: 'resources/triggers/send-push-notifications.ts',
      name: 'send-push-notifications',
      databaseAccess: { fullAccess: [table] },
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
