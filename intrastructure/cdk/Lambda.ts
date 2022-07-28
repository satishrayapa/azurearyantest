import { Runtime, Code, Function, FunctionProps } from '@aws-cdk/aws-lambda';
import { IBucket, Bucket } from '@aws-cdk/aws-s3';
import { Construct, Duration } from '@aws-cdk/core';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { env, getResourceName, StackType, withAssetId } from '../utils';
import { IRole } from '@aws-cdk/aws-iam';

const environment = {
  tableName: withAssetId(process.env.TABLE_NAME),
  notificationTableName: withAssetId(process.env.NOTIFICATION_TABLE_NAME),
};

interface LambdaProps {
  type?: StackType;
  file: string;
  name: string;
  dontAppendBasePath?: boolean;
  role?: IRole;
  timeout?: Duration;
  environment?: {
    [key: string]: string | undefined;
  };
  databaseAccess?: {
    read?: ITable[];
    write?: ITable[];
    readWrite?: ITable[];
    fullAccess?: ITable[];
  };
}

interface CustomConstruct extends Construct {
  baseFilePath?: string;
}

export class Lambda extends Function {
  constructor(scope: CustomConstruct, props: LambdaProps) {
    let filePath = props.file;
    let handler = props.file.replace('.ts', '.main');

    if (scope.baseFilePath && !props.dontAppendBasePath) {
      filePath = scope.baseFilePath + props.file;
    }

    if (props.dontAppendBasePath) {
      handler = handler.split('/').pop() || '';
    }

    const bucket: IBucket = Bucket.fromBucketArn(
      scope,
      `deployment-${props.name}`,
      env(
        props.type === StackType.Primary
          ? 'PRIMARY_AWS_BUCKET_ARN'
          : 'SECONDARY_AWS_BUCKET_ARN'
      )
    );

    const replacedPath = filePath
      .replace('resources/', '')
      .replace('.ts', '.zip');

    const codePath = process.env.AWS_BUCKET_PATH + '/' + replacedPath;

    const code = Code.fromBucket(bucket, codePath);

    const newProps: FunctionProps = {
      code,
      runtime: Runtime.NODEJS_14_X,
      functionName: getResourceName(props.name),
      timeout: props.timeout ?? (Duration.seconds(10) as any),
      role: props.role,
      handler,
      description: `Generated on: ${new Date().toISOString()}`,
      environment: { ...environment, ...props.environment },
    };

    super(scope, `${props.name}-lambda`, newProps);

    if (props.databaseAccess) {
      const { read, write, readWrite, fullAccess } = props.databaseAccess;
      read?.forEach((table) => table.grantReadData(this));
      write?.forEach((table) => table.grantWriteData(this));
      readWrite?.forEach((table) => table.grantReadWriteData(this));
      fullAccess?.forEach((table) => table.grantFullAccess(this));
    }
  }
}
