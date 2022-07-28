#!/usr/bin/env node
import 'dotenv/config';
import 'source-map-support/register';
import { TRCdk } from '@tr-aws-cdk/core';
import * as TrCdk from '@tr-aws-cdk/core';
import { LambdaRole } from '../intrastructure/cdk/LambdaRole';

const env = getEnvironmentVariables();

const app = TRCdk.newApp({
  environmentType: TrCdk.TRCdk.EnvType.DEVELOPMENT,
  assetId: env.TR_APP_ASSET_ID,
  resourceOwner: env.TR_RESOURCE_OWNER,
});

new LambdaRole(app);

function getEnvironmentVariables() {
  const {
    TR_APP_ASSET_ID,
    TR_ENVIRONMENT_TYPE,
    TR_RESOURCE_OWNER,
    APP_NAME,
  } = process.env;

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
