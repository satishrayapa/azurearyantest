import { Stack, StackProps } from '@aws-cdk/core';
import { TRApp } from '@tr-aws-cdk/core';
import { Tags } from './cdk/Tag';
import { TRBootstraplessSynthesizer } from './cdk/TRBootstraplessSynthesizer';
import { DeploymentBucket } from './cdk/DeploymentBucket';

export class CloudBridgeBucket extends Stack {
  constructor(scope: TRApp, stackProps?: StackProps) {

    const appName = `stack-${process.env.APP_NAME}-${
      process.env.TR_ENVIRONMENT_TYPE?.toLowerCase() || 'dev'
    }`;

    super(scope, appName, {
      synthesizer: new TRBootstraplessSynthesizer(scope),
      stackName: appName,
      ...stackProps,
    });

    const { bucket } = new DeploymentBucket(this);

    Tags.addTo(this);
  }
}
