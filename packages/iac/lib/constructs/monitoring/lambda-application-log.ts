import {
  aws_lambda,
  aws_logs,
  aws_cloudwatch,
  aws_cloudwatch_actions,
  Duration,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";

enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
}

interface LogLevelProps {
  /**
   * 指定したログレベルの文字列の監視を有効化する
   * @default false
   */
  readonly enable: boolean;
  /**
   * アラート発報の閾値
   * @default 1
   */
  readonly threshold?: number;
  /**
   * アラート発報の評価期間（分）
   * @default 1
   */
  readonly evaluationPeriods?: number;
}

interface LambdaApplicationLogMonitoringConstructProps {
  /**
   * アラート通知先の SNS アクション。
   */
  readonly notificationSnsAction: aws_cloudwatch_actions.SnsAction;
  /**
   * ログを監視する Lambda 関数
   */
  readonly lambdaFunction: aws_lambda.Function;
  /**
   * ログレベル "ERROR" の監視設定
   * @default undefined
   */
  readonly logLevelError?: LogLevelProps;
  /**
   * ログレベル "WARNING" の監視設定
   * @default undefined
   */
  readonly logLevelWarning?: LogLevelProps;
}

/**
 * Lambda 関数のアプリケーションログを監視する構成を作成するコンストラクト
 */
export class LambdaApplicationLogMonitoringConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: LambdaApplicationLogMonitoringConstructProps,
  ) {
    super(scope, id);

    const {
      lambdaFunction,
      logLevelError,
      logLevelWarning,
      notificationSnsAction,
    } = props;

    const logGroup = new aws_logs.LogGroup(this, "LogGroup", {
      logGroupName: `/aws/lambda/${lambdaFunction.functionName}`,
      removalPolicy: RemovalPolicy.DESTROY, // TODO: 必要に応じて Retain に変更
    });

    if (logLevelError && logLevelError.enable) {
      this.createAlarm(
        LogLevel.ERROR,
        logLevelError,
        this,
        lambdaFunction,
        logGroup,
        notificationSnsAction,
      );
    }

    if (logLevelWarning && logLevelWarning.enable) {
      this.createAlarm(
        LogLevel.WARN,
        logLevelWarning,
        this,
        lambdaFunction,
        logGroup,
        notificationSnsAction,
      );
    }
  }

  private createAlarm = (
    logLevel: LogLevel,
    logLevelProps: LogLevelProps,
    scope: Construct,
    lambdaFunction: aws_lambda.Function,
    logGroup: aws_logs.LogGroup,
    notificationSnsAction: aws_cloudwatch_actions.SnsAction,
  ): void => {
    const functionId = lambdaFunction.node.id;

    const metricFilter = new aws_logs.MetricFilter(
      scope,
      `${logLevel}MetricFilter`,
      {
        logGroup,
        metricNamespace: `Lambda/${functionId}`,
        metricName: logLevel,
        filterPattern: { logPatternString: logLevel },
      },
    );

    const metric = metricFilter.metric({
      period: Duration.minutes(1),
      statistic: aws_cloudwatch.Stats.SUM,
    });

    const alarm = new aws_cloudwatch.Alarm(scope, `${logLevel}Alarm`, {
      alarmName: `${functionId}ApplicationLog${logLevel}`,
      metric,
      threshold: logLevelProps.threshold ?? 1,
      evaluationPeriods: logLevelProps.evaluationPeriods ?? 1,
      treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    alarm.addAlarmAction(notificationSnsAction);
    alarm.addOkAction(notificationSnsAction);
  };
}
