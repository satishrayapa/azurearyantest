import { Construct } from '@aws-cdk/core';
import { HttpApi } from './HttpApi';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { IRole } from '@aws-cdk/aws-iam';
import { StackType } from '../utils';

export interface ConstructProps {
  scope: Construct;
  type: StackType;
  table: ITable;
  role?: IRole;
  api: HttpApi;
  notificationTable: ITable;
}

export declare class BaseConstruct {
  baseFilePath?: string;
  endpoint?: string;
}
