import { getIdTokenFromEnv } from "@/utils/cognito-helper";
import {
  getCompany,
  listCompanies,
  deleteCompany,
  Company,
  companyIdRegexPattern,
} from "@/utils/companies-table-helper";
import {
  getCurrentDayjs,
  isUnixTimestampMillisBetween,
} from "@/utils/datetime";
import {
  requestToRestApi,
  RestApiResponse,
} from "@/utils/rest-api-endpoint-helper";

const idToken = getIdTokenFromEnv();

export const companiesPostTests = () => {
  /**
   * ICASU_NOTE: 前処理を beforeAll() 、テスト実施を test() に明確に分離することにより、前処理とテスト項目が増えた場合でも可読性が損なわれないようになります。
   *             下記では、API へのリクエストによりレスポンスの取得と、リクエスト完了後のテーブル上のデータの取得、の 2 つを前処理として beforeAll() に記述しています。
   *
   * ICASU_NOTE: テストで確認したい項目が複数ある場合は、項目ごとに test() を分離することで、何をテストしているのかが明確になります。
   *             下記では、API レスポンスのテストと、リクエスト完了後のテーブル上のデータのテスト、の 2 つのテスト項目があるため、それぞれを別の test() に記述しています。
   */
  describe("正常なリクエストを送信した場合", () => {
    const testStartDatetime = getCurrentDayjs();
    const testEndDatetime = testStartDatetime.add(3, "second");
    const testCompanyName = "restApiCompaniesPostTest1";
    let response: RestApiResponse = undefined;
    let createdCompany: Company | undefined = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: "companies",
        method: "POST",
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        data: {
          name: testCompanyName,
        },
      });

      createdCompany = await getCompany(response?.data.id);
    });

    test("201 Created レスポンスを取得すること", () => {
      expect(response?.status).toBe(201);
      expect(response?.headers).toMatchObject({
        "access-control-allow-headers": "Content-Type,Authorization",
        "access-control-allow-methods": "OPTIONS,POST,PUT,GET,DELETE",
        "access-control-allow-origin": "*",
        "content-type": "application/json; charset=utf-8",
        location: `/companies/${response?.data.id}`,
      });
      expect(response?.data).toEqual({
        id: expect.any(String),
        createdAt: expect.any(Number),
        name: testCompanyName,
      });
    });

    test("会社データの ID が UUID v4 形式であること", () => {
      expect(response?.data.id).toMatch(companyIdRegexPattern);
    });

    test("会社データの作成日時がリクエスト送信時刻から 3 秒以内であること", () => {
      expect(
        isUnixTimestampMillisBetween(
          response?.data.createdAt,
          testStartDatetime,
          testEndDatetime,
        ),
      ).toBeTruthy();
    });

    test("テーブルにデータが作成されていること", () => {
      expect(createdCompany).toEqual(response?.data);
    });

    afterAll(async () => {
      await deleteCompany(response?.data.id);
    });
  });

  describe("データを定義しないリクエストを送信した場合", () => {
    const testCompanyName =
      new Date().getTime().toString() + "_apiTestCompanyName";
    let response: RestApiResponse = undefined;
    let createdCompany: Company | undefined = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: "companies",
        method: "POST",
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
      });

      const companies = await listCompanies();
      createdCompany = companies.find((item) => item.name === testCompanyName);
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

    test("テーブルにデータが作成されていないこと", () => {
      expect(createdCompany).toBeUndefined();
    });
  });

  describe("データスキーマが不正なリクエストを送信した場合", () => {
    const testCompanyName =
      new Date().getTime().toString() + "_apiTestCompanyName";
    let response: RestApiResponse = undefined;
    let createdCompany: Company | undefined = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: "companies",
        method: "POST",
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        data: {},
      });

      const companies = await listCompanies();
      createdCompany = companies.find((item) => item.name === testCompanyName);
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

    test("テーブルにデータが作成されていないこと", () => {
      expect(createdCompany).toBeUndefined();
    });
  });

  describe("認証情報が不正なリクエストを送信した場合", () => {
    const testCompanyName =
      new Date().getTime().toString() + "_apiTestCompanyName";
    let response: RestApiResponse = undefined;
    let createdCompany: Company | undefined = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: "companies",
        method: "POST",
        headers: {
          Authorization: "invalid token",
          "Content-Type": "application/json",
        },
        data: {
          name: "test company",
        },
      });

      const companies = await listCompanies();
      createdCompany = companies.find((item) => item.name === testCompanyName);
    });

    test("401 Unauthorized レスポンスを取得すること", () => {
      expect(response?.status).toBe(401);
      expect(response?.data).toEqual({ message: "Unauthorized" });
    });

    test("テーブルにデータが作成されていないこと", () => {
      expect(createdCompany).toBeUndefined();
    });
  });
};
