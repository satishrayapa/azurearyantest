import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { getResourceName, StackType } from '../utils';

export class AuthorizerRole extends cdk.Construct {
  public role: iam.IRole;

  constructor(scope: cdk.Construct, type: StackType) {
    const roleName = getResourceName('authorizer-role', type);

    super(scope, roleName + '-id');

    const lambdaPrincipal = new iam.ServicePrincipal('lambda.amazonaws.com');

    this.role = new iam.Role(scope, roleName, {
      roleName,
      path: '/service-role/',
      description: `JWT Authorizer Execution Role used by ${process.env.APP_NAME} to invoke lambda services`,
      assumedBy: new iam.CompositePrincipal(lambdaPrincipal),
      permissionsBoundary: {
        managedPolicyArn: `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:policy/tr-permission-boundary`,
      },
    });

    const executionPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'service-role/AWSLambdaBasicExecutionRole'
    );

    this.role.addManagedPolicy(executionPolicy);
  }
}
