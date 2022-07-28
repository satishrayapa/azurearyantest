import { BootstraplessSynthesizer } from '@aws-cdk/core';
import { TRApp } from '@tr-aws-cdk/core';

/**
 * A bootstrapless synthesizer that works with TR accounts.
 */
export class TRBootstraplessSynthesizer extends BootstraplessSynthesizer {
  /**
   * Creates a TR bootstrapless synthesizer.
   *
   * @param scope the TR App that will be synthesized
   */
  constructor(scope: TRApp) {
    const powerUser2Arn = `arn:aws:iam::\${AWS::AccountId}:role/human-role/a${scope.trContext.assetId}-PowerUser2`;
    super({
      cloudFormationExecutionRoleArn: powerUser2Arn,
      deployRoleArn: powerUser2Arn,
    });
  }
}
