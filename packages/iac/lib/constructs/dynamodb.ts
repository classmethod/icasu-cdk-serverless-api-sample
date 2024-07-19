import {
  aws_dynamodb,
  aws_cloudwatch_actions,
  aws_ssm,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { DynamodbMetricsMonitoringConstruct } from "./monitoring/dynamodb-metrics";

interface DynamodbConstructProps {
  projectName: string;
  envName: "dev" | "stg" | "prd";
  companiesTableIndustryCreatedAtIndexName: string;
  notificationSnsAction: aws_cloudwatch_actions.SnsAction;
}

export class DynamodbConstruct extends Construct {
  public readonly companiesTable: aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamodbConstructProps) {
    super(scope, id);

    const {
      projectName,
      envName,
      companiesTableIndustryCreatedAtIndexName,
      notificationSnsAction,
    } = props;

    /**
     * 会社テーブル
     */
    const companiesTable = new aws_dynamodb.Table(this, "CompaniesTable", {
      partitionKey: {
        name: "id",
        type: aws_dynamodb.AttributeType.STRING,
      },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      deletionProtection: true, // 削除保護を有効化
      removalPolicy: RemovalPolicy.DESTROY, // FIXME: 必要に応じて RETAIN に変更する
    });
    this.companiesTable = companiesTable;

    /**
     * 会社テーブル GSI
     */
    companiesTable.addGlobalSecondaryIndex({
      indexName: companiesTableIndustryCreatedAtIndexName,
      partitionKey: {
        name: "industry",
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: aws_dynamodb.AttributeType.NUMBER,
      },
      projectionType: aws_dynamodb.ProjectionType.ALL, // FIXME: 必要に応じて KEYS_ONLY または INCLUDE に変更する
    });

    /**
     * DynamoDB のメトリクス監視
     */
    new DynamodbMetricsMonitoringConstruct(this, "MetricsMonitoring", {
      notificationSnsAction,
      tableList: [companiesTable],
      tableIndexList: [
        {
          table: companiesTable,
          indexName: companiesTableIndustryCreatedAtIndexName,
        },
      ],
    });

    /**
     * E2E テストで使用するために、会社テーブル名 を SSM パラメータストアに保存
     */
    new aws_ssm.StringParameter(this, "CompaniesTableNameParameter", {
      parameterName: `/${envName}/${projectName}/e2e/COMPANIES_TABLE_NAME`,
      stringValue: companiesTable.tableName,
    });
  }
}
