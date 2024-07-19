import { getIdTokenFromEnv } from "@/utils/cognito-helper";
import { putCompany, deleteCompany } from "@/utils/companies-table-helper";
import { getCurrentUnixTimestampMillis } from "@/utils/datetime";
import {
  requestToRestApi,
  RestApiResponse,
} from "@/utils/rest-api-endpoint-helper";
import { generateUuidV4 } from "@/utils/uuid";

const idToken = getIdTokenFromEnv();

export const companiesIdGetTests = () => {
  const testCompanyId = generateUuidV4();
  const testCompany = {
    id: testCompanyId,
    createdAt: getCurrentUnixTimestampMillis(),
    name: "restApiCompaniesIdGetTest1",
  };

  beforeAll(async () => {
    await putCompany(testCompany);
  });

  afterAll(async () => {
    await deleteCompany(testCompanyId);
  });

  describe("正常なリクエストを送信した場合", () => {
    let response: RestApiResponse = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: `companies/${testCompanyId}`,
        method: "GET",
        headers: {
          Authorization: idToken,
        },
      });
    });

    test("200 OK レスポンスを取得すること", () => {
      expect(response?.status).toBe(200);
      expect(response?.headers).toMatchObject({
        "access-control-allow-headers": "Content-Type,Authorization",
        "access-control-allow-methods": "OPTIONS,POST,PUT,GET,DELETE",
        "access-control-allow-origin": "*",
        "content-type": "application/json; charset=utf-8",
      });
      expect(response?.data).toEqual(testCompany);
    });
  });

  describe("不正な形式の CompanyID を指定した場合", () => {
    let response: RestApiResponse = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: `companies/invalid_id`,
        method: "GET",
        headers: {
          Authorization: idToken,
        },
      });
    });

    test("400 Bad Request レスポンスを取得すること", () => {
      expect(response?.status).toBe(400);
      expect(response?.headers).toMatchObject({
        "access-control-allow-headers": "Content-Type,Authorization",
        "access-control-allow-methods": "OPTIONS,POST,PUT,GET,DELETE",
        "access-control-allow-origin": "*",
      });
      expect(response?.data).toBe("");
    });
  });

  describe("存在しない CompanyID を指定した場合", () => {
    const nonExistCompanyId = generateUuidV4();
    let response: RestApiResponse = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: `companies/${nonExistCompanyId}`,
        method: "GET",
        headers: {
          Authorization: idToken,
        },
      });
    });

    test("404 Not Found レスポンスを取得すること", () => {
      expect(response?.status).toBe(404);
      expect(response?.headers).toMatchObject({
        "access-control-allow-headers": "Content-Type,Authorization",
        "access-control-allow-methods": "OPTIONS,POST,PUT,GET,DELETE",
        "access-control-allow-origin": "*",
      });
      expect(response?.data).toBe("");
    });
  });

  describe("認証情報が不正なリクエストを送信した場合", () => {
    let response: RestApiResponse = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: `companies/${testCompanyId}`,
        method: "GET",
        headers: {
          Authorization: "invalid token",
        },
      });
    });

    test("401 Unauthorized レスポンスを取得すること", () => {
      expect(response?.status).toBe(401);
      expect(response?.data).toEqual({ message: "Unauthorized" });
    });
  });
};
