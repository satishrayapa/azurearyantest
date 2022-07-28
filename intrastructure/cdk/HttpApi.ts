import { Construct, Duration, Aws, Arn } from '@aws-cdk/core';
import {
  CfnAuthorizer,
  HttpApi as CdkHttpApi,
  HttpRouteKey,
  IDomainName,
  PayloadFormatVersion,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2';
import { CfnPermission, IFunction } from '@aws-cdk/aws-lambda';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Lambda } from './Lambda';
import { HttpRoute } from './HttpRoute';
import { getResourceName, StackType } from '../utils';
import { AuthorizerRole } from './AuthorizerRole';

interface AddLambdaRouteProps {
  handler: IFunction;
  method: HttpMethod;
  path: string;
  protected?: boolean;
}

export class HttpApi extends CdkHttpApi {
  public authorizer: CfnAuthorizer;
  public authorizerArn: string;
  public authorizerLambda: Lambda;
  public readonly scope: Construct;

  constructor(scope: Construct, domainName: IDomainName, type: StackType) {
    const apiName = getResourceName('api');

    super(scope, apiName, {
      apiName,
      defaultDomainMapping: {
        domainName,
      },
      description: 'API used for GTM Mobile application.',
    });

    this.scope = scope;
    this.createAuthorizer(type);
  }


  private createAuthorizer(type: StackType) {
    const { role } = new AuthorizerRole(this.scope, type);

    this.authorizerLambda = new Lambda(this.scope, {
      type,
      role,
      file: 'resources/authorizers/jwt-authorizer.ts',
      name: 'jwt-authorizer',
      environment: {
        authServiceUrl: process.env.AUTH_SERVICE_URL,
        authServicePeapodUrl: process.env.AUTH_SERVICE_PEAPOD_URL,
        authServiceBasicKey: process.env.AUTH_SERVICE_BASIC_KEY,
        peapodClientIds: process.env.PEAPOD_CLIENT_IDS,
      },
    });

    this.authorizerArn = `arn:aws:apigateway:${Aws.REGION}:lambda:path/2015-03-31/functions/${this.authorizerLambda.functionArn}/invocations`;

    this.authorizer = new CfnAuthorizer(this, 'jwt-authorizer-lambda', {
      apiId: this.httpApiId,
      authorizerPayloadFormatVersion: '2.0',
      authorizerResultTtlInSeconds: Duration.seconds(120).toSeconds(),
      authorizerType: 'REQUEST',
      enableSimpleResponses: true,
      authorizerUri: this.authorizerArn,
      identitySource: [
        '$request.header.Authorization',
        '$request.header.x-client-id',
      ],
      name: 'jwt-authorizer',
    });

    new CfnPermission(this, 'jwt-authorizer-permission', {
      action: 'lambda:InvokeFunction',
      principal: 'apigateway.amazonaws.com',
      functionName: this.authorizerLambda.functionArn,
      sourceArn: Arn.format(
        {
          service: 'execute-api',
          resource: this.apiId,
          resourceName: '*/*',
        },
        this.scope as any
      ),
    });
  }

  public addLambdaRoute(props: AddLambdaRouteProps) {
    if (props.protected === undefined) props.protected = true;

    const integration = new LambdaProxyIntegration({
      handler: props.handler,
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    });

    new HttpRoute(this.scope, `route-lambda-${props.handler.node.id}`, {
      httpApi: this,
      integration: integration,
      routeKey: HttpRouteKey.with(props.path, props.method),
      ...(props.protected
        ? {
            authorizerType: 'CUSTOM',
            authorizerId: this.authorizer.ref,
          }
        : {}),
    });
  }
}
