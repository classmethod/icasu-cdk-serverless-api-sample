import { aws_ssm, aws_sns, aws_cloudwatch_actions } from "aws-cdk-lib";
import { Construct } from "constructs";

interface AlertNotificationConstructProps {
  readonly envName: string;
  readonly commonResourcesProjectName: string;
}

export class AlertNotificationConstruct extends Construct {
  public readonly notificationSnsAction: aws_cloudwatch_actions.SnsAction;
  constructor(
    scope: Construct,
    id: string,
    props: AlertNotificationConstructProps,
  ) {
    super(scope, id);

    const { envName, commonResourcesProjectName } = props;

    /**
     * アラート通知用 SNS トピックの Arn を取得
     */
    const alertNotificationTopicArn =
      aws_ssm.StringParameter.fromStringParameterName(
        this,
        "AlertNotificationTopicArnParameter",
        `/${envName}/${commonResourcesProjectName}/alertNotificationTopicArn`,
      ).stringValue;

    /**
     * アラート通知用 SNS トピックを取得
     */
    const alertNotificationTopic = aws_sns.Topic.fromTopicArn(
      this,
      "AlertNotificationTopic",
      alertNotificationTopicArn,
    );

    /**
     * アラート通知用 SNS トピックをアクションとして指定
     */
    this.notificationSnsAction = new aws_cloudwatch_actions.SnsAction(
      alertNotificationTopic,
    );
  }
}
