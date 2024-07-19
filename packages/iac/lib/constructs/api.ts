import {
  aws_lambda,
  aws_lambda_nodejs,
  aws_dynamodb,
  aws_apigateway,
  aws_cognito,
  aws_cloudwatch_actions,
  aws_ssm,
  aws_wafv2,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { ApiGatewayMetricsMonitoringConstruct } from "./monitoring/api-gateway-metrics";
import { LambdaApplicationLogMonitoringConstruct } from "./monitoring/lambda-application-log";

interface ApiConstructProps {
  projectName: string;
  envName: "dev" | "stg" | "prd";
  companiesTableIndustryCreatedAtIndexName: string;
  companiesTable: aws_dynamodb.Table;
  cognitoUserPool: aws_cognito.UserPool;
  notificationSnsAction: aws_cloudwatch_actions.SnsAction;
  wafWebAcl: aws_wafv2.CfnWebACL;
}

/**
 * ICASU_NOTE: API Gateway による Restful API の実装は、REST API と HTTP API の2つが利用可能です。
 *             セキュリティやモニタリングのサービス品質を満たすために、AWS WAF や AWS X-Ray トレース機能をサポートしている **REST API** の採用を推奨します。
 *
 *             サポートされている機能の詳細については、以下の AWS 公式ドキュメントを参考にしてください。
 *             @see https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/http-api-vs-rest.html
 *
 *             本プロジェクトでは REST API を採用しています。
 */

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const {
      projectName,
      envName,
      companiesTableIndustryCreatedAtIndexName,
      companiesTable,
      cognitoUserPool,
      notificationSnsAction,
      wafWebAcl,
    } = props;

    /**
     * Lambda 関数を作成
     */
    const restApiFunc = new aws_lambda_nodejs.NodejsFunction(
      this,
      "RestApiFunc",
      {
        architecture: aws_lambda.Architecture.ARM_64, // 既定では X86_64 が指定される。パフォーマンスおよびコスト効率が向上する ARM_64 を指定
        entry: "../server/src/lambda/handlers/api-gateway/rest-api/router.ts",
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        environment: {
          COMPANIES_TABLE_NAME: companiesTable.tableName,
          COMPANIES_TABLE_INDUSTRY_CREATED_AT_INDEX_NAME:
            companiesTableIndustryCreatedAtIndexName,
          POWERTOOLS_SERVICE_NAME: `${envName}-${projectName}`, // Powertools for AWS Lambda の Logger の出力で service（サービス名）を指定
        },
        tracing: aws_lambda.Tracing.ACTIVE, // AWS X-Ray によるトレースを有効化
      },
    );
    companiesTable.grantReadWriteData(restApiFunc);

    /**
     * Lambda アプリケーションログ監視構成を作成
     */
    new LambdaApplicationLogMonitoringConstruct(
      this,
      `${restApiFunc.node.id}ApplicationLogMonitoring`,
      {
        notificationSnsAction,
        lambdaFunction: restApiFunc,
        logLevelError: {
          enable: true,
          threshold: 1,
          evaluationPeriods: 1,
        },
        logLevelWarning: {
          enable: true,
          threshold: 1,
          evaluationPeriods: 1,
        },
      },
    );

    /**
     * Cognito ユーザープール Authorizer を作成
     */
    const cognitoUserPoolsAuthorizer =
      new aws_apigateway.CognitoUserPoolsAuthorizer(
        this,
        "CognitoUserPoolsAuthorizer",
        {
          cognitoUserPools: [cognitoUserPool],
        },
      );

    /**
     * REST API を作成
     */
    const restApi = new aws_apigateway.LambdaRestApi(this, "RestApi", {
      handler: restApiFunc,
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, // TODO: オリジンを制限する
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: aws_apigateway.Cors.DEFAULT_HEADERS,
        maxAge: Duration.minutes(5),
      }, // Web アプリケーションからの CORS リクエストを許可する場合はこの記述を追加
      deployOptions: {
        stageName: "v1", // 既定では "prod" になるため、適切なステージ名に変更
        tracingEnabled: true, // AWS X-Ray によるトレースを有効化
      },
      defaultMethodOptions: { authorizer: cognitoUserPoolsAuthorizer },
    });

    /**
     * API レベルのエラー発生時のレスポンスに CORS エラーを抑制するヘッダーを追加
     */
    restApi.addGatewayResponse("Default4xx", {
      type: aws_apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'*'",
      },
    });
    restApi.addGatewayResponse("Default5xx", {
      type: aws_apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'*'",
      },
    });

    /**
     * API Gateway のメトリクス監視
     */
    new ApiGatewayMetricsMonitoringConstruct(
      this,
      "ApiGatewayMetricsMonitoring",
      {
        notificationSnsAction,
        restApiList: [restApi],
      },
    );

    /**
     * E2E テストで使用するために、SSM パラメータストアに API Gateway のエンドポイントを登録
     */
    new aws_ssm.StringParameter(this, "RestApiEndpointParameter", {
      parameterName: `/${envName}/${projectName}/e2e/REST_API_ENDPOINT`,
      stringValue: restApi.deploymentStage.urlForPath(),
    });

    /**
     * Web ACL と REST API の関連付け
     */
    new aws_wafv2.CfnWebACLAssociation(this, "WebAclRestApiAssociation", {
      resourceArn: restApi.deploymentStage.stageArn,
      webAclArn: wafWebAcl.attrArn,
    });
  }
}
