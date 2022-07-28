import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { getResourceName, StackType } from '../utils';

export class LambdaRole extends cdk.Construct {
  public role: iam.IRole;

  constructor(scope: cdk.Construct, type: StackType) {
    const roleName = getResourceName('lambda-role', type);

    super(scope, roleName);

    this.role = new iam.Role(scope, roleName + '-id', {
      roleName,
      path: '/service-role/',
      description: `Lambda Execution Role used by ${process.env.APP_NAME} lambda services`,
      permissionsBoundary: {
        managedPolicyArn: `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:policy/tr-permission-boundary`,
      },
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.AccountPrincipal(`${cdk.Aws.ACCOUNT_ID}`)
      ),
    });

    const executionPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'service-role/AWSLambdaBasicExecutionRole'
    );

    const dynamoPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonDynamoDBFullAccess'
    );

    const lambdaInvocation = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AWSLambdaInvocation-DynamoDB'
    );

    this.role.addManagedPolicy(dynamoPolicy);
    this.role.addManagedPolicy(lambdaInvocation);
    this.role.addManagedPolicy(executionPolicy);
  }
}
