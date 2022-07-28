import { IConstruct, IAspect, CfnResource } from '@aws-cdk/core';

export class PermissionsBoundary implements IAspect {
  private readonly permissionsBoundaryArn: string;

  constructor() {
    if (process.env.TR_PERMISSION_BOUNDARY_ARN)
      this.permissionsBoundaryArn = process.env.TR_PERMISSION_BOUNDARY_ARN;
  }

  public visit(node: IConstruct): void {
    if (!this.permissionsBoundaryArn) return;

    if (
      CfnResource.isCfnResource(node) &&
      node.cfnResourceType === 'AWS::IAM::Role'
    ) {
      console.log(`Overriding ${node.logicalId}`);
      node.addPropertyOverride(
        'PermissionsBoundary',
        this.permissionsBoundaryArn
      );
    }
  }
}
