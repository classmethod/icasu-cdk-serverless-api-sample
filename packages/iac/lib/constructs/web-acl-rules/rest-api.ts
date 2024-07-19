import { aws_wafv2 } from "aws-cdk-lib";

/**
 * Web ACL ルールリスト（Rest API 用）
 *
 * ICASU_NOTE: AWS WAF の運用開始直後は、マネージドルールグループによる評価時のアクションを COUNT で上書きする設定とし、
 *             正常なリクエストがブロックされないことを確認する期間を設けることを推奨します。
 *             ブロックされないことを確認できたら、評価時の上書きアクションを NONE に変更してください。
 *             @see https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-waf.html#user-pool-waf-evaluating-and-logging
 */
export const webAclRulesForRestApi: aws_wafv2.CfnWebACL.RuleProperty[] = [
  /**
   * AWSManagedRulesCommonRuleSet （コアルールセット (CRS) マネージドルールグループ）：推奨
   *
   * Web アプリケーションに一般的に適用可能なルールが含まれます。
   * OWASP Top 10 などで報告されている脆弱性の悪用（クロスサイトスクリプティングなど）から API を保護します。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-crs
   */
  {
    priority: 1,
    overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
    visibilityConfig: {
      sampledRequestsEnabled: true,
      cloudWatchMetricsEnabled: true,
      metricName: "AWS-AWSManagedRulesCommonRuleSet",
    },
    name: "AWSManagedRulesCommonRuleSet",
    statement: {
      managedRuleGroupStatement: {
        vendorName: "AWS",
        name: "AWSManagedRulesCommonRuleSet",
      },
    },
  },

  /**
   * AWSManagedRulesKnownBadInputsRuleSet （既知の不正な入力マネージドルールグループ）：推奨
   *
   * 既知の不正なリクエストパターンを検知するルールが含まれます。
   * 主にサーバーサイドの脆弱性の悪用（インジェクションなど）から API を保護します。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-known-bad-inputs
   */
  {
    priority: 2,
    overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
    visibilityConfig: {
      sampledRequestsEnabled: true,
      cloudWatchMetricsEnabled: true,
      metricName: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
    },
    name: "AWSManagedRulesKnownBadInputsRuleSet",
    statement: {
      managedRuleGroupStatement: {
        vendorName: "AWS",
        name: "AWSManagedRulesKnownBadInputsRuleSet",
      },
    },
  },

  /**
   * AWSManagedRulesAmazonIpReputationList （Amazon IP 評価リストマネージドルールグループ）：推奨
   *
   * Amazon 内部脅威インテリジェンスに基づくルールが含まれます。
   * ボット、偵察、DDOS に関連するアクティビティに関連付けられている IP アドレスから送信されたリクエストから API を保護します。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-ip-rep.html#aws-managed-rule-groups-ip-rep-amazon
   */
  {
    priority: 3,
    overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
    visibilityConfig: {
      sampledRequestsEnabled: true,
      cloudWatchMetricsEnabled: true,
      metricName: "AWS-AWSManagedRulesAmazonIpReputationList",
    },
    name: "AWSManagedRulesAmazonIpReputationList",
    statement: {
      managedRuleGroupStatement: {
        vendorName: "AWS",
        name: "AWSManagedRulesAmazonIpReputationList",
      },
    },
  },

  /**
   * AWSManagedRulesAnonymousIpList （匿名 IP リストマネージドルールグループ）：検討
   *
   * 匿名アクセスが疑われる IP リストからのリクエストを検知します。
   * 匿名プロキシなどを利用したアクセスの脅威から API を保護したい場合に適用を検討してください。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-ip-rep.html#aws-managed-rule-groups-ip-rep-anonymous
   */
  // {
  //   priority: 4,
  //   overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
  //   visibilityConfig: {
  //     sampledRequestsEnabled: true,
  //     cloudWatchMetricsEnabled: true,
  //     metricName: "AWS-AWSManagedRulesAnonymousIpList",
  //   },
  //   name: "AWSManagedRulesAnonymousIpList",
  //   statement: {
  //     managedRuleGroupStatement: {
  //       vendorName: "AWS",
  //       name: "AWSManagedRulesAnonymousIpList",
  //     },
  //   },
  // },

  /**
   * AWSManagedRulesSQLiRuleSet （SQL データベースマネージドルールグループ）：検討
   *
   * SQL インジェクションなどの SQL データベース悪用に関するリクエストを検知します。
   * SQL データベースを利用している場合に適用を検討してください。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-use-case.html#aws-managed-rule-groups-use-case-sql-db
   */
  // {
  //   priority: 5,
  //   overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
  //   visibilityConfig: {
  //     sampledRequestsEnabled: true,
  //     cloudWatchMetricsEnabled: true,
  //     metricName: "AWS-AWSManagedRulesSQLiRuleSet",
  //   },
  //   name: "AWSManagedRulesSQLiRuleSet",
  //   statement: {
  //     managedRuleGroupStatement: {
  //       vendorName: "AWS",
  //       name: "AWSManagedRulesSQLiRuleSet",
  //     },
  //   },
  // },

  /**
   * AWSManagedRulesAdminProtectionRuleSet （管理者保護マネージドルールグループ）：検討
   *
   * 公開されている管理ページへの外部アクセスをブロックするためのルールが含まれます。
   * 管理者機能を提供している API を保護したい場合に適用をしてください。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-admin
   */
  // {
  //   priority: 6,
  //   overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
  //   visibilityConfig: {
  //     sampledRequestsEnabled: true,
  //     cloudWatchMetricsEnabled: true,
  //     metricName: "AWS-AWSManagedRulesAdminProtectionRuleSet",
  //   },
  //   name: "AWSManagedRulesAdminProtectionRuleSet",
  //   statement: {
  //     managedRuleGroupStatement: {
  //       vendorName: "AWS",
  //       name: "AWSManagedRulesAdminProtectionRuleSet",
  //     },
  //   },
  // },

  /**
   * AWSManagedRulesBotControlRuleSet （Bot Control ルールグループ）：検討
   *
   * ボットからのリクエストを管理するルールを提供します。**利用には追加料金が必要**です。
   * ウェブスクレイピングや過剰な自動アクセスの脅威から API を保護したい場合に適用を検討してください。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-bot.html
   */
  // {
  //   priority: 7,
  //   overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
  //   visibilityConfig: {
  //     sampledRequestsEnabled: true,
  //     cloudWatchMetricsEnabled: true,
  //     metricName: "AWS-AWSManagedRulesBotControlRuleSet",
  //   },
  //   name: "AWSManagedRulesBotControlRuleSet",
  //   statement: {
  //     managedRuleGroupStatement: {
  //       vendorName: "AWS",
  //       name: "AWSManagedRulesBotControlRuleSet",
  //     },
  //   },
  // },

  /**
   * AWSManagedRulesACFPRuleSet （AWS WAF Fraud Control Account Creation Fraud Prevention (ACFP) ルールグループ）：検討
   *
   * アカウント作成エンドポイントに送信されるリクエストを検査します。**利用には追加料金が必要**です。
   * アカウント作成機能を提供する API を保護したい場合に適用を検討してください。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-acfp.html
   */
  // {
  //   priority: 8,
  //   overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
  //   visibilityConfig: {
  //     sampledRequestsEnabled: true,
  //     cloudWatchMetricsEnabled: true,
  //     metricName: "AWS-AWSManagedRulesACFPRuleSet",
  //   },
  //   name: "AWSManagedRulesACFPRuleSet",
  //   statement: {
  //     managedRuleGroupStatement: {
  //       vendorName: "AWS",
  //       name: "AWSManagedRulesACFPRuleSet",
  //     },
  //   },
  // },

  /**
   * AWSManagedRulesATPRuleSet （アカウント乗っ取り防止 (ATP) のルールグループ）：検討
   *
   * 悪意のあるアカウント乗っ取りの試みの一部である可能性があるリクエストにラベルを付けて管理します。**利用には追加料金が必要**です。
   * 不正ログインや詐取されたアカウントから API を保護したい場合に適用を検討してください。
   * @see https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-atp.html
   */
  // {
  //   priority: 9,
  //   overrideAction: { count: {} }, // FIXME: `{ none: {} }` に変更してブロックを有効化する
  //   visibilityConfig: {
  //     sampledRequestsEnabled: true,
  //     cloudWatchMetricsEnabled: true,
  //     metricName: "AWS-AWSManagedRulesATPRuleSet",
  //   },
  //   name: "AWSManagedRulesATPRuleSet",
  //   statement: {
  //     managedRuleGroupStatement: {
  //       vendorName: "AWS",
  //       name: "AWSManagedRulesATPRuleSet",
  //     },
  //   },
  // },
];
