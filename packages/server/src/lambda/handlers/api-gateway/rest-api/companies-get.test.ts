import { mockReq } from "sinon-express-mock";
import { companiesGetHandler } from "./companies-get";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { queryCompaniesService } from "@/lambda/domains/services/query-companies";
import { scanCompaniesService } from "@/lambda/domains/services/scan-companies";
import { convertIso8601StringToUnixTimestampMillis } from "@/utils/datetime";

const { scanCompaniesServiceMock, queryCompaniesServiceMock } = vi.hoisted(
  () => {
    return {
      scanCompaniesServiceMock: vi.fn(),
      queryCompaniesServiceMock: vi.fn(),
    };
  },
);
vi.mock("@/lambda/domains/services/scan-companies", () => {
  return {
    scanCompaniesService: scanCompaniesServiceMock,
  };
});
vi.mock("@/lambda/domains/services/query-companies", () => {
  return {
    queryCompaniesService: queryCompaniesServiceMock,
  };
});

describe("companiesGetHandler", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyTimestamp1 = convertIso8601StringToUnixTimestampMillis(
    "2024-01-01T00:00:00+09:00",
  );
  const dummyTimestamp1String = dummyTimestamp1.toString();
  const dummyTimestamp2 = convertIso8601StringToUnixTimestampMillis(
    "2024-07-07T00:00:00+09:00",
  );
  const dummyTimestamp2String = dummyTimestamp2.toString();

  const dummyCompany1 = {
    id: "e3162725-4b5b-4779-bf13-14d55d63a584",
    createdAt: dummyTimestamp1,
    name: "dummy-name-1",
    industry: "IT",
  };
  const dummyCompany2 = {
    id: "122db705-3791-289e-042c-740bec3add55",
    createdAt: dummyTimestamp2,
    name: "dummy-name-2",
    industry: "Manufacturing",
  };

  describe("正常な industry クエリパラメータが指定された場合", () => {
    describe.each([
      ["IT"],
      ["Manufacturing"],
      ["Finance"],
      ["Medical"],
      ["Other"],
    ])("industry: %s", (industry) => {
      let result: unknown = undefined;

      beforeAll(async (): Promise<void> => {
        queryCompaniesServiceMock.mockResolvedValue([
          dummyCompany1,
          dummyCompany2,
        ]);

        result = await companiesGetHandler(
          mockReq({
            query: { industry },
          }),
        );
      });

      test("queryCompaniesService の呼び出しが期待通り行われること", () => {
        expect(queryCompaniesService).toBeCalledTimes(1);
        expect(queryCompaniesService).toHaveBeenCalledWith(
          industry,
          undefined,
          undefined,
          3,
        );
        expect(scanCompaniesService).toBeCalledTimes(0);
      });

      test("ステータスコード 200 となり、取得データが返ること", () => {
        expect(result).toEqual({
          statusCode: 200,
          body: JSON.stringify([dummyCompany1, dummyCompany2]),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      });
    });
  });

  describe("不正な industry クエリパラメータが指定された場合", () => {
    describe.each([["invalid_industry"], [""], [null]])(
      "industry: %s",
      (industry) => {
        let result: unknown = undefined;

        beforeAll(async (): Promise<void> => {
          result = await companiesGetHandler(
            mockReq({
              query: { industry },
            }),
          );
        });

        test("いずれのサービスも呼び出されないこと", () => {
          expect(queryCompaniesService).toBeCalledTimes(0);
          expect(scanCompaniesService).toBeCalledTimes(0);
        });

        test("ステータスコード 400 が返ること", () => {
          expect(result).toEqual({
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Headers": "Content-Type,Authorization",
              "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
              "Access-Control-Allow-Origin": "*",
            },
          });
        });
      },
    );
  });

  describe("正常な created_after および created_before クエリパラメータが指定された場合", () => {
    describe.each([
      [
        dummyTimestamp1String,
        dummyTimestamp2String,
        dummyTimestamp1,
        dummyTimestamp2,
      ],
      [dummyTimestamp1String, undefined, dummyTimestamp1, undefined],
      [undefined, dummyTimestamp2String, undefined, dummyTimestamp2],
    ])(
      "created_after: %s, created_before: %s",
      (
        createdAfter,
        createdBefore,
        expectedServiceCallCreatedAfter,
        expectedServiceCallCreatedBefore,
      ) => {
        let result: unknown = undefined;

        beforeAll(async (): Promise<void> => {
          queryCompaniesServiceMock.mockResolvedValue([
            dummyCompany1,
            dummyCompany2,
          ]);

          result = await companiesGetHandler(
            mockReq({
              query: {
                industry: "IT",
                created_after: createdAfter,
                created_before: createdBefore,
              },
            }),
          );
        });

        test("queryCompaniesService の呼び出しが期待通り行われること", () => {
          expect(queryCompaniesService).toBeCalledTimes(1);
          expect(queryCompaniesService).toHaveBeenCalledWith(
            "IT",
            expectedServiceCallCreatedAfter,
            expectedServiceCallCreatedBefore,
            3,
          );
          expect(scanCompaniesService).toBeCalledTimes(0);
        });

        test("ステータスコード 200 となり、取得データが返ること", () => {
          expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify([dummyCompany1, dummyCompany2]),
            headers: {
              "Access-Control-Allow-Headers": "Content-Type,Authorization",
              "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
          });
        });
      },
    );

    describe("industry クエリパラメーターが指定されていない場合", () => {
      let result: unknown = undefined;

      beforeAll(async (): Promise<void> => {
        result = await companiesGetHandler(
          mockReq({
            query: {
              created_after: dummyTimestamp1String,
              created_before: dummyTimestamp2String,
            },
          }),
        );
      });

      test("いずれのサービスも呼び出されないこと", () => {
        expect(queryCompaniesService).toBeCalledTimes(0);
        expect(scanCompaniesService).toBeCalledTimes(0);
      });

      test("ステータスコード 400 が返ること", () => {
        expect(result).toEqual({
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
          },
        });
      });
    });
  });

  describe("不正な created_after および created_before クエリパラメータが指定された場合", () => {
    describe.each([
      ["invalid_timestamp", "invalid_timestamp"], // 数値の文字列ではない
      [dummyTimestamp1String, dummyTimestamp1String], // created_after = created_before
      [dummyTimestamp2String, dummyTimestamp1String], // created_after > created_before
      [-dummyTimestamp1String, dummyTimestamp1String], // created_after が負の数
      [
        // 13桁の数値の文字列ではない
        dummyTimestamp1String.substring(0, 10),
        dummyTimestamp2String.substring(0, 10),
      ],
    ])(
      "created_after: %s, created_before: %s",
      (createdAfter, createdBefore) => {
        let result: unknown = undefined;

        beforeAll(async (): Promise<void> => {
          result = await companiesGetHandler(
            mockReq({
              query: {
                industry: "IT",
                created_after: createdAfter,
                created_before: createdBefore,
              },
            }),
          );
        });

        test("いずれのサービスも呼び出されないこと", () => {
          expect(queryCompaniesService).toBeCalledTimes(0);
          expect(scanCompaniesService).toBeCalledTimes(0);
        });

        test("ステータスコード 400 が返ること", () => {
          expect(result).toEqual({
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Headers": "Content-Type,Authorization",
              "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
              "Access-Control-Allow-Origin": "*",
            },
          });
        });
      },
    );
  });

  describe("正常な max_items クエリパラメータが指定された場合", () => {
    describe.each([
      [undefined, 3],
      ["1", 1],
      ["5", 5],
    ])("max_items: %s, expectedMaxItems: %d", (maxItems, expectedMaxItems) => {
      let result: unknown = undefined;

      beforeAll(async (): Promise<void> => {
        scanCompaniesServiceMock.mockResolvedValue([
          dummyCompany1,
          dummyCompany2,
        ]);

        result = await companiesGetHandler(
          mockReq({
            query: { max_items: maxItems },
          }),
        );
      });

      test("scanCompaniesService の呼び出しが期待通り行われること", () => {
        expect(scanCompaniesService).toBeCalledTimes(1);
        expect(scanCompaniesService).toHaveBeenCalledWith({
          maxItems: expectedMaxItems,
        });
        expect(queryCompaniesService).toBeCalledTimes(0);
      });

      test("ステータスコード 200 となり、取得データが返ること", () => {
        expect(result).toEqual({
          statusCode: 200,
          body: JSON.stringify([dummyCompany1, dummyCompany2]),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      });
    });

    describe("CompanyServiceUnknownError をキャッチした場合", () => {
      let result: unknown = undefined;

      beforeAll(async (): Promise<void> => {
        scanCompaniesServiceMock.mockRejectedValue(CompanyServiceUnknownError);

        result = await companiesGetHandler(
          mockReq({
            query: { max_items: "3" },
          }),
        );
      });

      test("scanCompaniesService の呼び出しが期待通り行われること", () => {
        expect(scanCompaniesService).toBeCalledTimes(1);
        expect(scanCompaniesService).toHaveBeenCalledWith({
          maxItems: 3,
        });
        expect(queryCompaniesService).toBeCalledTimes(0);
      });

      test("ステータスコード 500 が返ること", () => {
        expect(result).toEqual({
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
          },
        });
      });
    });
  });

  describe("不正な max_items クエリパラメータが指定された場合", () => {
    describe.each([["0"], ["6"], ["-1"], ["1.1"], ["aaa"]])(
      "max_items: %s",
      (maxItems) => {
        let result: unknown = undefined;

        beforeAll(async (): Promise<void> => {
          scanCompaniesServiceMock.mockResolvedValue([
            dummyCompany1,
            dummyCompany2,
          ]);

          result = await companiesGetHandler(
            mockReq({
              query: { max_items: maxItems },
            }),
          );
        });

        test("いずれのサービスも呼び出されないこと", () => {
          expect(scanCompaniesService).toBeCalledTimes(0);
          expect(queryCompaniesService).toBeCalledTimes(0);
        });

        test("ステータスコード 400 が返ること", () => {
          expect(result).toEqual({
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Headers": "Content-Type,Authorization",
              "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
              "Access-Control-Allow-Origin": "*",
            },
          });
        });
      },
    );
  });
});
