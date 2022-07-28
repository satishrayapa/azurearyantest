import DomainName from './DomainName';
import { CfnRecordSet, CfnHealthCheck, RecordType } from '@aws-cdk/aws-route53';
import { Aws, Construct } from '@aws-cdk/core';
import { HttpApi } from './HttpApi';
import { env, StackType, withAppName } from '../utils';

interface Route53MappingProps {
  api: HttpApi;
  domainName: DomainName;
  failover: StackType;
}

export default class MultiregionMapping extends Construct {
  healthCheck: CfnHealthCheck;

  constructor(
    scope: Construct,
    { api, domainName, failover }: Route53MappingProps
  ) {
    super(scope, 'route-53-mapping');

    if (failover === StackType.Primary) {
      this.healthCheck = new CfnHealthCheck(this as any, 'HealthCheck', {
        healthCheckConfig: {
          type: 'HTTPS',
          fullyQualifiedDomainName: `${api.apiId}.execute-api.${Aws.REGION}.amazonaws.com`,
          resourcePath: 'onboarding',
        },
      });
    }

    new CfnRecordSet(this as any, 'ApiGatewayRecordSet', {
      name: env('ROUTE53_DOMAIN_NAME'),
      hostedZoneId: env('ROUTE53_HOSTED_ZONE_ID'),
      type: RecordType.CNAME,
      ttl: '300',
      failover,
      resourceRecords: [domainName.regionalDomainName],
      setIdentifier: withAppName('record-set', failover),
      ...(failover === StackType.Primary
        ? {
            healthCheckId: this.healthCheck.attrHealthCheckId,
          }
        : {}),
    });
  }
}
