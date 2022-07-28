#!/usr/bin/env node
import 'dotenv/config';
import 'source-map-support/register';
import { TRCdk } from '@tr-aws-cdk/core';
import { TRBootstraplessSynthesizer } from '../intrastructure/cdk/TRBootstraplessSynthesizer';
import { CloudBridge } from '../intrastructure/CloudBridge';
import { Aws } from '@aws-cdk/core';
import { split, StackType } from '../intrastructure/utils';

const env = getEnvironmentVariables();

const app = TRCdk.newApp({
  environmentType: env.TR_ENVIRONMENT_TYPE as TRCdk.EnvType,
  assetId: env.TR_APP_ASSET_ID,
  resourceOwner: env.TR_RESOURCE_OWNER,
});

const regions = split(process.env.REPLICATION_REGIONS);

if (!regions || regions.length == 0)
  throw new Error(
    'You must set at least one region in REPLICATION_REGIONS environment variable.'
  );

let stackProps = {
  synthesizer: new TRBootstraplessSynthesizer(app),
  env: {
    account: Aws.ACCOUNT_ID,
    region: Aws.REGION,
  },
};

const { database } = new CloudBridge(app, stackProps, {
  type: process.env.PRIMARY_TABLE_STREAM_ARN
    ? StackType.Secondary
    : StackType.Primary,
});

// for (const region of regions) {
//   const stackProps = {
//     synthesizer: new TRBootstraplessSynthesizer(app),
//     env: {
//       account: Aws.ACCOUNT_ID,
//       region: region,
//     },
//   };

//   new CloudBridge(app, stackProps, { type: StackType.Secondary, database });
// }

function getEnvironmentVariables() {
  const { TR_APP_ASSET_ID, TR_ENVIRONMENT_TYPE, TR_RESOURCE_OWNER, APP_NAME } =
    process.env;

  if (!APP_NAME) {
    throw new Error('Environment variable APP_NAME is not set.');
  }
  if (!TR_APP_ASSET_ID) {
    throw new Error('Environment variable TR_APP_ASSET_ID is not set.');
  }
  if (!TR_ENVIRONMENT_TYPE) {
    throw new Error('Environment variable TR_ENVIRONMENT_TYPE is not set.');
  }
  if (!TR_RESOURCE_OWNER) {
    throw new Error('Environment variable TR_RESOURCE_OWNER is not set.');
  }

  return {
    TR_APP_ASSET_ID,
    TR_ENVIRONMENT_TYPE,
    TR_RESOURCE_OWNER,
    APP_NAME,
  };
}
