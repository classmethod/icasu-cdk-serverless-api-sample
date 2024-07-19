import { setEnvironmentVariables } from "@/environment";
import { createUser, getIdToken, deleteUser } from "@/utils/cognito-helper";

const timestamp = new Date().getTime().toString();
const testUserName = `${timestamp}_apiTestUser@example.com`;
const testUserPassword = `${timestamp}aA!`;

export const setup = async (): Promise<void> => {
  await setEnvironmentVariables();

  const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";
  const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || "";

  await createUser(testUserName, testUserPassword, COGNITO_USER_POOL_ID);
  const testUserIdToken = await getIdToken(
    testUserName,
    testUserPassword,
    COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID,
  );
  process.env["TEST_USER_ID_TOKEN"] = testUserIdToken;
};

export const teardown = async (): Promise<void> => {
  const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";

  await deleteUser(testUserName, COGNITO_USER_POOL_ID);
};
