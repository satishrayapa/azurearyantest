import { Stack, StackProps } from '@aws-cdk/core';
import { TRApp } from '@tr-aws-cdk/core';
import { HttpApi } from './cdk/HttpApi';
import { Database } from './stacks/Database';
import { AuthService } from './stacks/AuthService';
import { UserService } from './stacks/UserService';
import { TRBootstraplessSynthesizer } from './cdk/TRBootstraplessSynthesizer';
import { LambdaRole } from './cdk/LambdaRole';
import { Tags } from './cdk/Tag';
import { StackType, withAppName } from './utils';
import { DocumentService } from './stacks/DocumentService';
import { EventService } from './stacks/EventService';
import { NewsService } from './stacks/NewsService';
import { AppNotificationService } from './stacks/NotificationService';
import { OnboardingService } from './stacks/OnboardingService';
import { PushNotificationService } from './stacks/PushNotificationService';
import { SurveyService } from './stacks/SurveyService';
import { WidgetService } from './stacks/WidgetService';
import MultiregionMapping from './cdk/MultiregionMapping';
import DomainName from './cdk/DomainName';

interface CloudBridgeProps {
  database?: Database;
  type: StackType;
}

export class CloudBridge extends Stack {
  database: Database;

  constructor(
    scope: TRApp,
    stackProps: StackProps,
    { database, type }: CloudBridgeProps
  ) {
    const appName = withAppName(process.env.TR_ENVIRONMENT_TYPE, type);

    super(scope, appName, {
      synthesizer: new TRBootstraplessSynthesizer(scope),
      stackName: appName,
      ...stackProps,
    });

    const domainName = new DomainName(this, type);

    // this.database = database ?? new Database(this);
    this.database = new Database(this, type);

    const api = new HttpApi(this, domainName, type);

    new MultiregionMapping(this, { api, domainName, failover: type });

    const { role } = new LambdaRole(this, type);

    const props = {
      scope: this,
      type,
      role,
      api,
      table: this.database.table,
      notificationTable: this.database.notificationTable,
    };

    //Authentication
    new AuthService(props);

    //Documents (in-out/mobile)
    new DocumentService(props);

    // Entities stacks
    new NewsService(props);
    new SurveyService(props);
    new WidgetService(props);
    new UserService(props);
    new EventService(props);
    new OnboardingService(props);

    // Notifications stacks
    new PushNotificationService(props);
    new AppNotificationService(props);

    Tags.addTo(this);
  }
}
