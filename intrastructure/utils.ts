export function withAppName(...args: Array<string | undefined>) {
  const appName = process.env.APP_NAME;

  if (!appName) throw new Error('Environment variable APP_NAME is not set.');

  return appName + '-' + args.join('-').toLowerCase();
}

export function withAssetId(...args: Array<string | undefined>) {
  const assetId = process.env.TR_APP_ASSET_ID;

  if (!assetId)
    throw new Error('Environment variable TR_APP_ASSET_ID is not set.');

  return 'a' + assetId + '-' + args.join('-').toLowerCase();
}

export function getResourceName(...args: Array<string | undefined>) {
  const assetId = process.env.TR_APP_ASSET_ID;

  if (!assetId)
    throw new Error('Environment variable TR_APP_ASSET_ID is not set.');

  const appName = process.env.APP_NAME;

  if (!appName) throw new Error('Environment variable APP_NAME is not set.');

  let result = `a${assetId}-${appName}`.toLowerCase();

  return !args.length ? result : result + '-' + args.join('-').toLowerCase();
}

export function split(str: string | undefined): string[] {
  if (!str) throw new Error('Cannot split undefined.');

  return str?.replace(/\s+/g, '')?.split(',');
}

export enum StackType {
  Primary = 'PRIMARY',
  Secondary = 'SECONDARY',
}

export function env(key: string): string {
  if (!key || !process.env[key])
    throw new Error(`Environment variable ${key} not set.`);

  return process.env[key] as string;
}
