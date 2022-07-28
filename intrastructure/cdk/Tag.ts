import { Tags as CdkTags, Construct } from '@aws-cdk/core';

export class Tags {
  static addTo(scope: Construct) {
    const {
      TR_APP_ASSET_ID,
      TR_ENVIRONMENT_TYPE,
      TR_RESOURCE_OWNER,
      TR_PROJECT_NAME,
    } = process.env;

    if (TR_APP_ASSET_ID) {
      CdkTags.of(scope).add('tr:application-asset-insight-id', TR_APP_ASSET_ID);
    }

    if (TR_ENVIRONMENT_TYPE) {
      CdkTags.of(scope).add('tr:environment-type', TR_ENVIRONMENT_TYPE);
    }

    if (TR_RESOURCE_OWNER) {
      CdkTags.of(scope).add('tr:resource-owner', TR_RESOURCE_OWNER);
    }
    
    if (TR_PROJECT_NAME) {
      CdkTags.of(scope).add('tr:project-name', TR_PROJECT_NAME);
    }
  }
}
