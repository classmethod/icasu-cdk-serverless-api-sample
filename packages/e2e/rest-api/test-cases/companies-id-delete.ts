import { getIdTokenFromEnv } from "@/utils/cognito-helper";
import {
  putCompany,
  deleteCompany,
  getCompany,
  Company,
} from "@/utils/companies-table-helper";
import { getCurrentUnixTimestampMillis } from "@/utils/datetime";
import {
  requestToRestApi,
  RestApiResponse,
} from "@/utils/rest-api-endpoint-helper";
import { generateUuidV4 } from "@/utils/uuid";

const idToken = getIdTokenFromEnv();

export const companiesIdDeleteTests = () => {
  const testCompanyId = generateUuidV4();

  afterAll(async () => {
    await deleteCompany(testCompanyId);
  });

  describe("正常なリクエストを送信した場合", () => {
    let response: RestApiResponse = undefined;
    let company: Company | undefined = undefined;

    beforeAll(async () => {
      await putCompany({
        id: testCompanyId,
        createdAt: getCurrentUnixTimestampMillis(),
        name: "restApiCompaniesIdDeleteTest1",
      });
      response = await requestToRestApi({
        path: `companies/${testCompanyId}`,
        method: "DELETE",
        headers: {
          Authorization: idToken,
        },
      });

      company = await getCompany(testCompanyId);
    });

    test("204 No Content レスポンスを取得すること", () => {
      expect(response?.status).toBe(204);
      expect(response?.headers).toMatchObject({
        "access-control-allow-headers": "Content-Type,Authorization",
        "access-control-allow-methods": "OPTIONS,POST,PUT,GET,DELETE",
        "access-control-allow-origin": "*",
      });
      expect(response?.data).toBe("");
    });

    test("削除された Company が取得できないこと", async () => {
      expect(company).toBeUndefined();
    });
  });

  describe("不正な形式の CompanyID を指定した場合", () => {
    let response: RestApiResponse = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: `companies/invalid_id`,
        method: "DELETE",
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
        method: "DELETE",
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
        method: "DELETE",
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
