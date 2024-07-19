import { aws_cognito, aws_ssm, aws_wafv2 } from "aws-cdk-lib";
import { Construct } from "constructs";

interface CognitoConstructProps {
  projectName: string;
  envName: "dev" | "stg" | "prd";
  domainPrefix: string;
  callbackUrls: string[];
  logoutUrls: string[];
  addClientForE2ETest: boolean;
  wafWebAcl: aws_wafv2.CfnWebACL;
}

export class CognitoConstruct extends Construct {
  public readonly userPool: aws_cognito.UserPool;
  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    const {
      projectName,
      envName,
      domainPrefix,
      callbackUrls,
      logoutUrls,
      addClientForE2ETest,
      wafWebAcl,
    } = props;

    /**
     * Cognito ユーザープールを作成
     */
    const userPool = new aws_cognito.UserPool(this, "UserPool", {
      signInAliases: {
        email: true, // サインインIDにユーザーネームではなくメールアドレスを使用する
      },
      deletionProtection: true, // 誤削除防止
      mfa: aws_cognito.Mfa.OPTIONAL, // MFA を任意で有効化可能とする
    });
    this.userPool = userPool;

    /**
     * Cognito ユーザープールドメインを作成
     */
    userPool.addDomain("UserPoolDomain", {
      cognitoDomain: { domainPrefix },
    });

    /**
     * Cognito ユーザープールクライアントを作成
     */
    userPool.addClient("UserPoolClient", {
      generateSecret: false,
      oAuth: {
        callbackUrls: callbackUrls,
        logoutUrls: logoutUrls,
        flows: { authorizationCodeGrant: true }, // 大抵のケースでは authorizationCodeGrant のみ有効化すれば良い。既定では implicitCodeGrant フローが有効になっているため、無効化する。
        scopes: [
          // 既定値には必要以上のスコープが含まれているため、必要最小限のスコープを指定する
          aws_cognito.OAuthScope.EMAIL,
          aws_cognito.OAuthScope.PROFILE,
          aws_cognito.OAuthScope.OPENID,
        ],
      },
    });

    /**
     * E2E テストで使用するために、SSM パラメータストアに Cognito ユーザープール ID を登録
     */
    new aws_ssm.StringParameter(this, "UserPoolIdParameter", {
      parameterName: `/${envName}/${projectName}/e2e/COGNITO_USER_POOL_ID`,
      stringValue: userPool.userPoolId,
    });

    /**
     * E2E テスト用の Cognito ユーザープールクライアントを作成
     */
    if (addClientForE2ETest) {
      const userPoolClient = userPool.addClient("UserPoolClientForE2ETest", {
        generateSecret: false,
        oAuth: {
          callbackUrls: callbackUrls,
          logoutUrls: logoutUrls,
          flows: { authorizationCodeGrant: true },
          scopes: [
            aws_cognito.OAuthScope.EMAIL,
            aws_cognito.OAuthScope.PROFILE,
            aws_cognito.OAuthScope.OPENID,
          ],
        },
        authFlows: { adminUserPassword: true }, // 管理者権限でユーザーの ID トークンを取得可能とするため有効化
      });

      /**
       * E2E テストで使用する Cognito クライアント ID を SSM パラメータストアに登録
       */
      new aws_ssm.StringParameter(this, "ClientIdParameter", {
        parameterName: `/${envName}/${projectName}/e2e/COGNITO_CLIENT_ID`,
        stringValue: userPoolClient.userPoolClientId,
      });
    }

    /**
     * User Pool と REST API の関連付け
     */
    new aws_wafv2.CfnWebACLAssociation(this, "WebAclUserPoolAssociation", {
      resourceArn: userPool.userPoolArn,
      webAclArn: wafWebAcl.attrArn,
    });
  }
}
