import { getParameter } from "@aws-lambda-powertools/parameters/ssm";

const env = process.env.ENVIRONMENT === "staging" ? "stg" : "dev";

const parameterPrefix = `/${env}/icasu-cdk-serverless-api-sample/e2e`;

const envKeys = [
  "COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID",
  "REST_API_ENDPOINT",
  "COMPANIES_TABLE_NAME",
];

export const setEnvironmentVariables = async (): Promise<void> => {
  await Promise.all(
    envKeys.map(async (envKey) => {
      process.env[envKey] = await getParameter(`${parameterPrefix}/${envKey}`);
    }),
  );
};
