import { DomainName as CdkDomainName } from '@aws-cdk/aws-apigatewayv2';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Construct } from '@aws-cdk/core';
import { StackType, env } from '../utils';

export default class DomainName extends CdkDomainName {
  constructor(scope: Construct, type: StackType) {
    super(scope, 'domain', {
      domainName: process.env.ROUTE53_DOMAIN_NAME as string,
      certificate: Certificate.fromCertificateArn(
        scope,
        'acm-certificate',
        env(`${type}_ACM_CERTIFICATE_ARN`)
      ),
    });
  }
}
