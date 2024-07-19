import {
  aws_apigateway,
  aws_cloudwatch,
  aws_cloudwatch_actions,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { getConstructId } from "./shared/utils";

interface ApiGatewayMetricsMonitoringConstructConstructProps {
  /**
   * アラート通知先の SNS アクション。
   */
  readonly notificationSnsAction: aws_cloudwatch_actions.SnsAction;
  /**
   * 監視対象の REST API のリスト
   */
  readonly restApiList: aws_apigateway.RestApi[];
}

export class ApiGatewayMetricsMonitoringConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: ApiGatewayMetricsMonitoringConstructConstructProps,
  ) {
    super(scope, id);

    const { notificationSnsAction, restApiList } = props;

    // 各 REST API の監視アラームを作成
    restApiList.forEach((restApi) => {
      this.createAlarm(restApi, notificationSnsAction);
    });
  }

  /**
   * REST API の監視アラームを作成
   * @param restApi
   * @param notificationSnsAction
   */
  private createAlarm = (
    restApi: aws_apigateway.RestApi,
    notificationSnsAction: aws_cloudwatch_actions.SnsAction,
  ) => {
    const restApiConstructId = getConstructId(restApi);

    /**
     * サーバーエラーの監視
     * @see https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
     */
    const errorAlarm = new aws_cloudwatch.Alarm(
      this,
      `${restApiConstructId}5XXErrorAlarm`,
      {
        alarmName: `ApiGateway${restApiConstructId}5XXError`,
        metric: new aws_cloudwatch.Metric({
          namespace: "AWS/ApiGateway",
          metricName: "5XXError",
          dimensionsMap: {
            ApiName: restApi.restApiName,
          },
          period: Duration.seconds(30),
          statistic: aws_cloudwatch.Stats.SUM,
        }),
        threshold: 10, // TODO: 必要に応じて調整する
        evaluationPeriods: 1,
        treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      },
    );
    errorAlarm.addAlarmAction(notificationSnsAction);
    errorAlarm.addOkAction(notificationSnsAction);
  };
}
