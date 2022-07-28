import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { env, split, StackType, withAssetId } from '../utils';
import {
  AttributeType,
  Table,
  StreamViewType,
  ProjectionType,
  BillingMode,
  ITable,
} from '@aws-cdk/aws-dynamodb';

export class Database extends Construct {
  public table: ITable;
  public notificationTable: ITable;

  constructor(scope: Construct, type: StackType) {
    super(scope, 'DynamoStack');

    if (type === StackType.Secondary) {
      this.table = Table.fromTableAttributes(scope, 'existing-data-table', {
        tableName: withAssetId(process.env.TABLE_NAME),
        tableStreamArn: env('PRIMARY_TABLE_STREAM_ARN'),
      });

      this.notificationTable = Table.fromTableAttributes(
        scope,
        'existing-notification-table',
        {
          tableName: withAssetId(process.env.NOTIFICATION_TABLE_NAME),
        }
      );
      return;
    }

    const table = new Table(this, 'table', {
      partitionKey: {
        name: 'partitionKey',
        type: AttributeType.STRING,
      },
      sortKey: { name: 'sortKey', type: AttributeType.STRING },
      tableName: withAssetId(process.env.TABLE_NAME),
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl',
      // replicationRegions: regions,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'CreatedDate',
      partitionKey: { name: 'partitionKey', type: AttributeType.STRING },
      sortKey: { name: 'createdDate', type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'UpdatedDate',
      partitionKey: { name: 'partitionKey', type: AttributeType.STRING },
      sortKey: { name: 'updatedDate', type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    const notificationTable = new Table(this, 'notification-table', {
      partitionKey: {
        name: 'partitionKey',
        type: AttributeType.STRING,
      },
      sortKey: { name: 'sortKey', type: AttributeType.STRING },
      tableName: withAssetId(process.env.NOTIFICATION_TABLE_NAME),
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl',
      // replicationRegions: regions,
    });

    notificationTable.addGlobalSecondaryIndex({
      indexName: 'CreatedDate',
      partitionKey: { name: 'partitionKey', type: AttributeType.STRING },
      sortKey: { name: 'createdDate', type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    this.table = table;
    this.notificationTable = notificationTable;
  }
}
