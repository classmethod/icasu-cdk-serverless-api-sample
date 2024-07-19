import {
  aws_dynamodb,
  aws_cloudwatch,
  aws_cloudwatch_actions,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { getConstructId } from "./shared/utils";

interface TableIndex {
  readonly table: aws_dynamodb.Table;
  readonly indexName: string;
}

interface DynamodbMetricsMonitoringConstructProps {
  /**
   * アラート通知先の SNS アクション。
   */
  readonly notificationSnsAction: aws_cloudwatch_actions.SnsAction;
  /**
   * 監視対象のテーブルのリスト
   * @default undefined
   */
  readonly tableList?: aws_dynamodb.Table[];
  /**
   * 監視対象のテーブル GSI のリスト
   * @default undefined
   */
  readonly tableIndexList?: TableIndex[];
}

export class DynamodbMetricsMonitoringConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: DynamodbMetricsMonitoringConstructProps,
  ) {
    super(scope, id);

    const { notificationSnsAction, tableList, tableIndexList } = props;

    // 各テーブルの監視アラームを作成
    if (tableList) {
      tableList.forEach((table) => {
        this.createTableAlarm(table, notificationSnsAction);
      });
    }

    // 各テーブル GSI の監視アラームを作成
    if (tableIndexList) {
      tableIndexList.forEach((tableIndex) => {
        this.createTableIndexAlarm(tableIndex, notificationSnsAction);
      });
    }
  }

  /**
   * テーブルの監視アラームを作成
   * @param table
   * @param notificationSnsAction
   */
  private createTableAlarm = (
    table: aws_dynamodb.Table,
    notificationSnsAction: aws_cloudwatch_actions.SnsAction,
  ): void => {
    const tableName = table.tableName;
    const tableConstructId = getConstructId(table);

    /**
     * システムエラー監視アラーム
     * @see https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/metrics-dimensions.html#SystemErrors
     */
    const systemErrorsAlarm = new aws_cloudwatch.Alarm(
      this,
      `${tableConstructId}SystemErrorsAlarm`,
      {
        alarmName: `Dynamodb${tableConstructId}SystemErrors`,
        metric: new aws_cloudwatch.Metric({
          namespace: "AWS/DynamoDB",
          metricName: "SystemErrors",
          dimensionsMap: {
            TableName: tableName,
          },
          period: Duration.minutes(1),
          statistic: aws_cloudwatch.Stats.SUM,
        }),
        threshold: 3, // TODO: 必要に応じて調整する
        evaluationPeriods: 1,
        treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      },
    );
    systemErrorsAlarm.addAlarmAction(notificationSnsAction);
    systemErrorsAlarm.addOkAction(notificationSnsAction);

    /**
     * プロビジョニング済みスループット監視アラーム（オンデマンドモードのテーブルでは不要）
     * @see https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/metrics-dimensions.html#ThrottledRequests
     */
    // const throttledRequestsAlarm = new aws_cloudwatch.Alarm(
    //   this,
    //   `${tableConstructId}ThrottledRequestsAlarm`,
    //   {
    //     alarmName: `Dynamodb${tableConstructId}ThrottledRequests`,
    //     metric: new aws_cloudwatch.Metric({
    //       namespace: "AWS/DynamoDB",
    //       metricName: "ThrottledRequests",
    //       dimensionsMap: {
    //         TableName: tableName,
    //       },
    //       period: Duration.minutes(1),
    //       statistic: aws_cloudwatch.Stats.SUM,
    //     }),
    //     threshold: 1, // TODO: 必要に応じて調整する
    //     evaluationPeriods: 1,
    //     treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    //   },
    // );
    // throttledRequestsAlarm.addAlarmAction(notificationSnsAction);
    // throttledRequestsAlarm.addOkAction(notificationSnsAction);

    /**
     * 読み取りキャパシティユニット監視アラーム
     * @see https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/metrics-dimensions.html#ConsumedReadCapacityUnits
     */
    const consumedReadCapacityUnitsAlarm = new aws_cloudwatch.Alarm(
      this,
      `${tableConstructId}ConsumedReadCapacityUnitsAlarm`,
      {
        alarmName: `Dynamodb${tableConstructId}ConsumedReadCapacityUnits`,
        metric: new aws_cloudwatch.Metric({
          namespace: "AWS/DynamoDB",
          metricName: "ConsumedReadCapacityUnits",
          dimensionsMap: {
            TableName: tableName,
          },
          period: Duration.minutes(1),
          statistic: aws_cloudwatch.Stats.SUM,
        }),
        threshold: 10000, // TODO: 必要に応じて調整する
        evaluationPeriods: 1,
        treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      },
    );
    consumedReadCapacityUnitsAlarm.addAlarmAction(notificationSnsAction);
    consumedReadCapacityUnitsAlarm.addOkAction(notificationSnsAction);

    /**
     * 書き込みキャパシティユニット監視アラーム
     * @see https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/metrics-dimensions.html#ConsumedWriteCapacityUnits
     */
    const consumedWriteCapacityUnitsAlarm = new aws_cloudwatch.Alarm(
      this,
      `${tableConstructId}ConsumedWriteCapacityUnitsAlarm`,
      {
        alarmName: `Dynamodb${tableConstructId}ConsumedWriteCapacityUnits`,
        metric: new aws_cloudwatch.Metric({
          namespace: "AWS/DynamoDB",
          metricName: "ConsumedWriteCapacityUnits",
          dimensionsMap: {
            TableName: tableName,
          },
          period: Duration.minutes(1),
          statistic: aws_cloudwatch.Stats.SUM,
        }),
        threshold: 10000, // TODO: 必要に応じて調整する
        evaluationPeriods: 1,
        treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      },
    );
    consumedWriteCapacityUnitsAlarm.addAlarmAction(notificationSnsAction);
    consumedWriteCapacityUnitsAlarm.addOkAction(notificationSnsAction);
  };

  /**
   * GSI の監視アラームを作成
   * @param tableIndex
   * @param notificationSnsAction
   */
  private createTableIndexAlarm = (
    tableIndex: TableIndex,
    notificationSnsAction: aws_cloudwatch_actions.SnsAction,
  ) => {
    const tableName = tableIndex.table.tableName;
    const tableConstructId = getConstructId(tableIndex.table);
    const indexName = tableIndex.indexName;

    /**
     * 読み取りキャパシティユニット監視アラーム
     * @see https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/metrics-dimensions.html#ConsumedReadCapacityUnits
     */
    const consumedReadCapacityUnitsAlarm = new aws_cloudwatch.Alarm(
      this,
      `${tableConstructId}${indexName}ConsumedReadCapacityUnitsAlarm`,
      {
        alarmName: `Dynamodb${tableConstructId}${indexName}ConsumedReadCapacityUnits`,
        metric: new aws_cloudwatch.Metric({
          namespace: "AWS/DynamoDB",
          metricName: "ConsumedReadCapacityUnits",
          dimensionsMap: {
            GlobalSecondaryIndexName: indexName,
            TableName: tableName,
          },
          period: Duration.minutes(1),
          statistic: aws_cloudwatch.Stats.SUM,
        }),
        threshold: 10000, // TODO: 必要に応じて調整する
        evaluationPeriods: 1,
        treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      },
    );
    consumedReadCapacityUnitsAlarm.addAlarmAction(notificationSnsAction);
    consumedReadCapacityUnitsAlarm.addOkAction(notificationSnsAction);

    /**
     * 書き込みキャパシティユニット監視アラーム
     * @see https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/metrics-dimensions.html#ConsumedWriteCapacityUnits
     */
    const consumedWriteCapacityUnitsAlarm = new aws_cloudwatch.Alarm(
      this,
      `${tableConstructId}${indexName}ConsumedWriteCapacityUnitsAlarm`,
      {
        alarmName: `Dynamodb${tableConstructId}${indexName}ConsumedWriteCapacityUnits`,
        metric: new aws_cloudwatch.Metric({
          namespace: "AWS/DynamoDB",
          metricName: "ConsumedWriteCapacityUnits",
          dimensionsMap: {
            GlobalSecondaryIndexName: indexName,
            TableName: tableName,
          },
          period: Duration.minutes(1),
          statistic: aws_cloudwatch.Stats.SUM,
        }),
        threshold: 10000, // TODO: 必要に応じて調整する
        evaluationPeriods: 1,
        treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      },
    );
    consumedWriteCapacityUnitsAlarm.addAlarmAction(notificationSnsAction);
    consumedWriteCapacityUnitsAlarm.addOkAction(notificationSnsAction);
  };
}
