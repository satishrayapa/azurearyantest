import {
  CfnRoute,
  CfnRouteProps,
  HttpRouteProps as BaseHttpRouteProps,
  IHttpApi,
  IHttpRoute,
} from '@aws-cdk/aws-apigatewayv2';
import { Construct, Resource } from '@aws-cdk/core';

interface HttpRouteProps extends BaseHttpRouteProps {
  authorizerId?: string;
  authorizerType?: string;
}

export class HttpRoute extends Resource {
  public readonly routeId: string;
  public readonly httpApi: IHttpApi;
  public readonly path?: string;

  constructor(scope: Construct, id: string, props: HttpRouteProps) {
    super(scope, id);

    this.httpApi = props.httpApi;
    this.path = props.routeKey.path;

    const config = props.integration.bind({
      route: this as any,
      scope: this as any,
    });

    const integration = props.httpApi._addIntegration(this, config);

    const routeProps: CfnRouteProps = {
      apiId: props.httpApi.apiId,
      routeKey: props.routeKey.key,
      target: `integrations/${integration.integrationId}`,
      authorizerId: props.authorizerId,
      authorizationType: props.authorizerType,
    };

    const route = new CfnRoute(this as any, 'Resource', routeProps);
    this.routeId = route.ref;
  }
}
