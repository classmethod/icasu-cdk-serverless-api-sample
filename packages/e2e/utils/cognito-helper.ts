import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  MessageActionType,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  apiVersion: "2016-04-18",
  region: "ap-northeast-1",
});

// ユーザー作成
export const createUser = async (
  Username: string,
  Password: string,
  UserPoolId: string,
): Promise<void> => {
  await client.send(
    new AdminCreateUserCommand({
      UserPoolId,
      Username,
      UserAttributes: [
        {
          Name: "email",
          Value: Username,
        },
        {
          Name: "email_verified",
          Value: "true",
        },
      ],
      MessageAction: MessageActionType.SUPPRESS,
    }),
  );

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId,
      Username,
      Password,
      Permanent: true,
    }),
  );
};

// ID トークン取得
export const getIdToken = async (
  Username: string,
  Password: string,
  UserPoolId: string,
  ClientId: string,
): Promise<string> => {
  const auth = await client.send(
    new AdminInitiateAuthCommand({
      UserPoolId,
      ClientId,
      AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: Username,
        PASSWORD: Password,
      },
    }),
  );

  if (!auth.AuthenticationResult || !auth.AuthenticationResult.IdToken) {
    throw new Error("Failed get id token.");
  }

  return auth.AuthenticationResult.IdToken;
};

// ユーザー削除
export const deleteUser = async (
  Username: string,
  UserPoolId: string,
): Promise<void> => {
  await client.send(
    new AdminDeleteUserCommand({
      UserPoolId,
      Username,
    }),
  );
};

export const getIdTokenFromEnv = (): string => {
  const TEST_USER_ID_TOKEN = process.env.TEST_USER_ID_TOKEN;

  if (!TEST_USER_ID_TOKEN) {
    throw new Error("TEST_USER_ID_TOKEN is not defined.");
  }

  return TEST_USER_ID_TOKEN;
};
