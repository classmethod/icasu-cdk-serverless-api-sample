import { getIdTokenFromEnv } from "@/utils/cognito-helper";
import {
  putCompany,
  deleteCompany,
  Company,
} from "@/utils/companies-table-helper";
import { convertIso8601StringToUnixTimestampMillis } from "@/utils/datetime";
import {
  requestToRestApi,
  RestApiResponse,
} from "@/utils/rest-api-endpoint-helper";
import { generateUuidV4 } from "@/utils/uuid";

const idToken = getIdTokenFromEnv();

export const companiesGetTests = () => {
  const maxItemsUpperLimit = 5;
  const defaultMaxItems = 3;
  const testUnixTimestampMillis1 = convertIso8601StringToUnixTimestampMillis(
    "2024-01-01T00:00:00+09:00",
  );
  const testUnixTimestampMillis2 = convertIso8601StringToUnixTimestampMillis(
    "2024-07-07T00:00:00+09:00",
  );
  const testUnixTimestampMillis3 = convertIso8601StringToUnixTimestampMillis(
    "2024-12-31T00:00:00+09:00",
  );
  const testCompanyName = "restApiCompaniesGetTest";

  const createdCompanyDataOfItIndustry: Company[] = [
    {
      id: generateUuidV4(),
      createdAt: testUnixTimestampMillis1,
      name: testCompanyName,
      industry: "IT",
    },
    {
      id: generateUuidV4(),
      createdAt: testUnixTimestampMillis2,
      name: testCompanyName,
      industry: "IT",
    },
    {
      id: generateUuidV4(),
      createdAt: testUnixTimestampMillis3,
      name: testCompanyName,
      industry: "IT",
    },
  ];
  const createdCompanyDataOfManufacturingIndustry: Company[] = [
    {
      id: generateUuidV4(),
      createdAt: testUnixTimestampMillis1,
      name: testCompanyName,
      industry: "Manufacturing",
    },
    {
      id: generateUuidV4(),
      createdAt: testUnixTimestampMillis2,
      name: testCompanyName,
      industry: "Manufacturing",
    },
    {
      id: generateUuidV4(),
      createdAt: testUnixTimestampMillis3,
      name: testCompanyName,
      industry: "Manufacturing",
    },
  ];

  const createdCompanyData: Company[] = [
    ...createdCompanyDataOfItIndustry,
    ...createdCompanyDataOfManufacturingIndustry,
  ];

  beforeAll(async () => {
    await Promise.all(
      createdCompanyData.map(async (company) => {
        await putCompany(company);
      }),
    );
  });

  afterAll(async () => {
    await Promise.all(
      createdCompanyData.map(async (company) => {
        await deleteCompany(company.id);
      }),
    );
  });

  const unixTimestampMillis1 = convertIso8601StringToUnixTimestampMillis(
    "2023-01-01T00:00:00+09:00",
  );
  const unixTimestampMillis2 = convertIso8601StringToUnixTimestampMillis(
    "2024-03-01T00:00:00+09:00",
  );
  const unixTimestampMillis3 = convertIso8601StringToUnixTimestampMillis(
    "2024-09-01T00:00:00+09:00",
  );
  const unixTimestampMillis4 = convertIso8601StringToUnixTimestampMillis(
    "2025-01-01T00:00:00+09:00",
  );
  const unixTimestampMillis5 = convertIso8601StringToUnixTimestampMillis(
    "2026-01-01T00:00:00+09:00",
  );

  describe("industry クエリパラメータを指定した場合", () => {
    describe("正常な industry クエリパラメータを指定した場合", () => {
      describe("created_after および created_before クエリパラメータを指定しない場合", () => {
        describe.each([
          ["IT", createdCompanyDataOfItIndustry],
          ["Manufacturing", createdCompanyDataOfManufacturingIndustry],
          ["Finance", []],
          ["Medical", []],
          ["Other", []],
        ])(
          "industry: %s, expectedGetResultCount: %d",
          (industry, expectedGetResult) => {
            let response: RestApiResponse = undefined;

            beforeAll(async () => {
              response = await requestToRestApi({
                path: "companies",
                method: "GET",
                headers: {
                  Authorization: idToken,
                },
                params: {
                  industry,
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
            });

            test("指定した件数のデータを取得すること", () => {
              expect(response?.data).toEqual(expectedGetResult);
            });
          },
        );
      });

      describe("正常な created_after および created_before クエリパラメータを指定した場合", () => {
        describe.each([
          [
            "IT",
            unixTimestampMillis2,
            unixTimestampMillis3,
            [createdCompanyDataOfItIndustry[1]],
          ],
          [
            "IT",
            unixTimestampMillis1,
            unixTimestampMillis4,
            createdCompanyDataOfItIndustry,
          ],
          [
            "IT",
            unixTimestampMillis1,
            unixTimestampMillis3,
            [
              createdCompanyDataOfItIndustry[0],
              createdCompanyDataOfItIndustry[1],
            ],
          ],
          ["IT", unixTimestampMillis4, unixTimestampMillis5, []],
          [
            "IT",
            unixTimestampMillis1,
            undefined,
            createdCompanyDataOfItIndustry,
          ],
          [
            "IT",
            undefined,
            unixTimestampMillis4,
            createdCompanyDataOfItIndustry,
          ],
          ["IT", undefined, undefined, createdCompanyDataOfItIndustry],
          [
            "Manufacturing",
            unixTimestampMillis2,
            unixTimestampMillis3,
            [createdCompanyDataOfManufacturingIndustry[1]],
          ],
        ])(
          "industry: %s, createdAfter: %d, createdBefore: %d",
          (industry, createdAfter, createdBefore, expectedGetResult) => {
            let response: RestApiResponse = undefined;

            beforeAll(async () => {
              response = await requestToRestApi({
                path: "companies",
                method: "GET",
                headers: {
                  Authorization: idToken,
                },
                params: {
                  industry,
                  created_after: createdAfter,
                  created_before: createdBefore,
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
            });

            test("レスポンスデータが期待通りであること", () => {
              expect(response?.data).toEqual(expectedGetResult);
            });
          },
        );

        describe("max_items クエリパラメーターを指定した場合", () => {
          describe.each([
            [1, [createdCompanyDataOfItIndustry[0]]],
            [maxItemsUpperLimit, createdCompanyDataOfItIndustry],
          ])("max_items: %d", (maxItems, expectedGetResult) => {
            let response: RestApiResponse = undefined;

            beforeAll(async () => {
              response = await requestToRestApi({
                path: "companies",
                method: "GET",
                headers: {
                  Authorization: idToken,
                },
                params: {
                  industry: "IT",
                  createdAfter: unixTimestampMillis1,
                  createdBefore: unixTimestampMillis4,
                  max_items: maxItems,
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
            });

            test("レスポンスデータが期待通りであること", () => {
              expect(response?.data).toEqual(expectedGetResult);
            });
          });
        });
      });

      describe("不正な created_after および created_before クエリパラメータを指定した場合", () => {
        describe.each([
          ["invalid_created_after", "invalid_created_before"],
          [unixTimestampMillis1, unixTimestampMillis1],
          [unixTimestampMillis2, unixTimestampMillis1],
          [-unixTimestampMillis1, unixTimestampMillis2],
        ])(
          "createdAfter: %s, createdBefore: %s",
          (createdAfter, createdBefore) => {
            let response: RestApiResponse = undefined;

            beforeAll(async () => {
              response = await requestToRestApi({
                path: "companies",
                method: "GET",
                headers: {
                  Authorization: idToken,
                },
                params: {
                  industry: "IT",
                  created_after: createdAfter,
                  created_before: createdBefore,
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
          },
        );
      });
    });

    describe("不正な industry クエリパラメータを指定した場合", () => {
      describe.each([[""], ["invalid_industry"]])(
        "industry: %s",
        (industry) => {
          let response: RestApiResponse = undefined;

          beforeAll(async () => {
            response = await requestToRestApi({
              path: "companies",
              method: "GET",
              headers: {
                Authorization: idToken,
              },
              params: {
                industry,
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
        },
      );
    });
  });

  describe("industry クエリパラメータを指定しない場合", () => {
    describe("正常な max_items クエリパラメータを指定した場合", () => {
      describe.each([
        [undefined, defaultMaxItems],
        [1, 1],
        [maxItemsUpperLimit, maxItemsUpperLimit],
      ])(
        "max_items: %d, expectedGetResultCount: %d",
        (maxItems, expectedGetResultCount) => {
          let response: RestApiResponse = undefined;

          beforeAll(async () => {
            response = await requestToRestApi({
              path: "companies",
              method: "GET",
              headers: {
                Authorization: idToken,
              },
              params: {
                max_items: maxItems,
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
          });

          test("指定した件数のデータを取得すること", () => {
            expect(response?.data).toHaveLength(expectedGetResultCount);
          });
        },
      );
    });

    describe("不正な max_items クエリパラメータを指定した場合", () => {
      describe.each([[0], [6], [-1], [1.1], ["aaa"]])(
        "max_items: %d",
        (maxItems) => {
          let response: RestApiResponse = undefined;

          beforeAll(async () => {
            response = await requestToRestApi({
              path: "companies",
              method: "GET",
              headers: {
                Authorization: idToken,
              },
              params: {
                max_items: maxItems,
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
        },
      );
    });

    describe("max_items クエリパラメータを指定しない場合", () => {
      let response: RestApiResponse = undefined;

      beforeAll(async () => {
        response = await requestToRestApi({
          path: "companies",
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
      });

      test("デフォルトの件数のデータを取得すること", () => {
        expect(response?.data).toHaveLength(defaultMaxItems);
      });
    });

    describe("created_after および created_before クエリパラメータを指定した場合", () => {
      let response: RestApiResponse = undefined;

      beforeAll(async () => {
        response = await requestToRestApi({
          path: "companies",
          method: "GET",
          headers: {
            Authorization: idToken,
          },
          params: {
            created_before: unixTimestampMillis1,
            created_after: unixTimestampMillis2,
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
  });

  describe("認証情報が不正なリクエストを送信した場合", () => {
    let response: RestApiResponse = undefined;

    beforeAll(async () => {
      response = await requestToRestApi({
        path: "companies",
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
