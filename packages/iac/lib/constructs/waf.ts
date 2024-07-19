import { aws_wafv2, aws_logs, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

interface WafConstructProps extends StackProps {
  webAclScope: "REGIONAL" | "CLOUDFRONT";
  webAclRules: aws_wafv2.CfnWebACL.RuleProperty[];
}

/**
 * ICASU_NOTE: AWS WAF は、アプリケーションへのリクエストの特性の変化や、脆弱性情報の更新、新しい攻撃手法の発見などに対応するため、継続的な運用が必要です。
 *             顧客側で運用が難しい場合は WafCharm などの WAF 運用サービスの導入も検討してください。
 *             @see: https://www.wafcharm.com/jp/
 */

export class WafConstruct extends Construct {
  public readonly webAcl: aws_wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: WafConstructProps) {
    super(scope, id);

    const { webAclScope, webAclRules } = props;

    const webAcl = new aws_wafv2.CfnWebACL(this, "WebAcl", {
      defaultAction: { allow: {} },
      scope: webAclScope,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: "WebAcl",
      },
      /**
       * Web ACL に適用するルールリストの設定。以下理由により別ファイルでの管理としています:
       *
       * - Web ACL の適用対象のリソース種類や機能によって、適したルールを選択可能とするため
       * - ルールは継続的な変更が発生する可能性があり、他の WAF に関する実装とライフサイクルを分けるため
       */
      rules: webAclRules,
    });
    this.webAcl = webAcl;

    /**
     * WAF ログ出力先となる CloudWatch Logs ロググループを作成
     *
     * ICASU_NOTE: ログを長期間保管したい場合や、書き込みおよび保管コストを削減したい場合は、
     *             ログ出力先として S3 Bucket や Data Firehose Delivery Stream の利用を検討してください。
     */
    const logGroup = new aws_logs.LogGroup(this, "LogGroup", {
      logGroupName: `aws-waf-logs-${webAcl.attrId}`,
      retention: aws_logs.RetentionDays.ONE_MONTH, // FIXME: 必要に応じて適切な保持期間に変更する
      removalPolicy: RemovalPolicy.DESTROY, // FIXME: 必要に応じて RETAIN に変更する
    });

    /**
     * WAF ログ出力設定
     */
    const logConfig = new aws_wafv2.CfnLoggingConfiguration(this, "LogConfig", {
      logDestinationConfigs: [logGroup.logGroupArn],
      resourceArn: webAcl.attrArn,
      /**
       * WAF ログ出力フィルタリング設定
       * @see https://dev.classmethod.jp/articles/aws-waf-config-trouble-caused-by-different-versions-of-awscli/#toc-6
       * @see https://docs.aws.amazon.com/waf/latest/APIReference/API_LoggingFilter.html
       *
       * ICASU_NOTE: ログ出力の対象を、ルールの条件にヒットしたリクエストに限定することにより、ログの量を抑制してコストを軽減しています。
       *             すべてのリクエストをログ出力する場合は、LoggingFilter の設定を削除してください。
       */
      loggingFilter: {
        Filters: [
          {
            Behavior: "KEEP",
            Requirement: "MEETS_ANY",
            Conditions: [
              {
                ActionCondition: {
                  Action: "BLOCK",
                },
              },
              {
                ActionCondition: {
                  Action: "COUNT",
                },
              },
              {
                ActionCondition: {
                  Action: "EXCLUDED_AS_COUNT",
                },
              },
            ],
          },
        ],
        DefaultBehavior: "DROP",
      },
    });

    // L1 Construct 同士の依存関係を明示的に設定
    logConfig.addDependency(webAcl);
  }
}
