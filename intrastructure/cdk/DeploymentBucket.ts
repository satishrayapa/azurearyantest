import { Aws, Construct } from '@aws-cdk/core';
import { Role, PolicyStatement } from '@aws-cdk/aws-iam';
import {
  Bucket,
  BlockPublicAccess,
  BucketProps,
  BucketEncryption,
} from '@aws-cdk/aws-s3';
import { RemovalPolicy } from '@aws-cdk/core/lib/removal-policy';

export class DeploymentBucket extends Construct {
  bucket: Bucket;

  constructor(scope: Construct) {
    const bucketName = `a${process.env.TR_APP_ASSET_ID}-${
      process.env.APP_NAME
    }-deployment-bucket-${process.env.TR_ENVIRONMENT_TYPE?.toLowerCase()}`;

    super(scope, bucketName);

    this.createBucket(bucketName);
    this.setBucketPolicy();
  }

  private createBucket(bucketName: string) {
    const bucketProps: BucketProps = {
      bucketName,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      }),
      encryption: BucketEncryption.UNENCRYPTED,
      publicReadAccess: false,
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY,
    };

    this.bucket = new Bucket(this, bucketName, bucketProps);
  }

  private setBucketPolicy(): void {
    const assetId = process.env.TR_APP_ASSET_ID;
    const humanRoleArn = `arn:aws:iam::${Aws.ACCOUNT_ID}:role/human-role/a${assetId}-PowerUser2`;
    const accountHumanRole = Role.fromRoleArn(this, 'PowerUser2', humanRoleArn);

    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:Get*', 's3:Put*', 's3:List*'],
        resources: [this.bucket.bucketArn, this.bucket.arnForObjects('*')],
        principals: [accountHumanRole],
      })
    );
  }
}
