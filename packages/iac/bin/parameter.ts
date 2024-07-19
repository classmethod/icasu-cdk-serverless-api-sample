import { Environment } from "aws-cdk-lib";

export interface AppParameter {
  projectName: string; // プロジェクト名
  envName: "dev" | "stg" | "prd"; // 環境名フラグ
  env: Environment; // デプロイ先の AWS アカウント ID および AWS リージョン
  commonResourcesProjectName: string; // 共通リソース管理用のプロジェクト名
  cognito: {
    // Cognito ユーザープールの設定
    domainPrefix: string; // ドメインプレフィックス
    callbackUrls: string[]; // コールバック URL
    logoutUrls: string[]; // ログアウト URL
    addClientForE2ETest: boolean; // E2E テストで ID トークンを管理者権限で取得する用のクライアントを追加するフラグ。本番環境では有効にしないこと
  };
  dynamodb: {
    companiesTableIndustryCreatedAtIndexName: string; // 会社テーブルの GSI の名前
  };
  gitHub: {
    // GitHub Actions の実行環境の情報
    owner: string; // GitHub リポジトリのオーナー
    repo: string; // GitHub リポジトリ名
  };
}

const commonParameter = {
  projectName: "icasu-cdk-serverless-api-sample",
  commonResourcesProjectName: "icasu-cdk-common-resources-sample",
  dynamodb: {
    companiesTableIndustryCreatedAtIndexName: "IndustryCreatedAtIndex",
  },
  gitHub: {
    owner: "classmethod-internal",
    repo: "icasu-cdk-serverless-api-sample",
  },
};

export const devParameter: AppParameter = {
  ...commonParameter,
  envName: "dev",
  env: {
    region: "ap-northeast-1",
  },
  cognito: {
    domainPrefix: `dev-${commonParameter.projectName}`,
    callbackUrls: ["https://dev.example.com/"],
    logoutUrls: ["https://dev.example.com/"],
    addClientForE2ETest: true,
  },
};

export const stgParameter: AppParameter = {
  ...commonParameter,
  envName: "stg",
  env: {
    region: "ap-northeast-1",
  },
  cognito: {
    domainPrefix: `stg-${commonParameter.projectName}`,
    callbackUrls: ["https://stg.example.com/"],
    logoutUrls: ["https://stg.example.com/"],
    addClientForE2ETest: true,
  },
};

export const prdParameter: AppParameter = {
  ...commonParameter,
  envName: "prd",
  env: {
    region: "ap-northeast-1",
  },
  cognito: {
    domainPrefix: `prd-${commonParameter.projectName}`,
    callbackUrls: ["https://example.com/"],
    logoutUrls: ["https://example.com/"],
    addClientForE2ETest: false,
  },
};

/**
 * AWS アカウント ID を環境変数から取得する
 * @param envKey 環境キー
 * @returns AWS アカウント ID
 */
const getAwsAccountIdFromProcessEnv = (
  envKey: "dev" | "stg" | "prd",
): string => {
  const awsAccountId = process.env[`${envKey.toUpperCase()}_AWS_ACCOUNT_ID`];
  if (!awsAccountId) {
    throw new Error(`Not found AWS account ID: ${envKey}`);
  }
  return awsAccountId;
};

/**
 * 指定した環境のパラメータを取得する
 * @param envKey 環境キー
 * @returns 指定した環境のパラメータ
 */
export const getAppParameter = (
  envKey: "dev" | "stg" | "prd",
): AppParameter => {
  const parameters = [devParameter, stgParameter, prdParameter];
  const appParameters = parameters.filter(
    (obj: AppParameter) => obj.envName === envKey,
  );
  if (appParameters.length === 0) {
    throw new Error(`Not found environment key: ${envKey}`);
  }
  const appParameter = appParameters[0];

  const awsAccountId = getAwsAccountIdFromProcessEnv(envKey);

  appParameter.env = {
    account: awsAccountId,
    region: appParameter.env.region,
  };

  return appParameter;
};
