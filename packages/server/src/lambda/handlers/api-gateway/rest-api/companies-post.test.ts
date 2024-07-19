import { mockReq } from "sinon-express-mock";
import { companiesIdPostHandler } from "./companies-post";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { createCompanyService } from "@/lambda/domains/services/create-company";
import { CompaniesTableAlreadyExistsError } from "@/lambda/infrastructures/errors/companies-table";

const { createCompanyServiceMock } = vi.hoisted(() => {
  return {
    createCompanyServiceMock: vi.fn(),
  };
});
vi.mock("@/lambda/domains/services/create-company", () => {
  return {
    createCompanyService: createCompanyServiceMock,
  };
});

describe("companiesIdPostHandler", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyCompanyId1 = "e3162725-4b5b-4779-bf13-14d55d63a584";
  const dummyTimestamp1 = new Date("2024-01-01T00:00:00+09:00").getTime();
  const dummyCompanyName1 = "dummy-name-1";

  const dummyCompanyItem1 = {
    id: dummyCompanyId1,
    createdAt: dummyTimestamp1,
    name: dummyCompanyName1,
  };

  describe("正常な Event データが渡された場合", () => {
    describe("実行が正常に行われた場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        createCompanyServiceMock.mockResolvedValue(dummyCompanyItem1);

        result = await companiesIdPostHandler(
          mockReq({
            body: { name: dummyCompanyName1 },
          }),
        );
      });

      test("createCompanyService の呼び出しが期待通り行われること", () => {
        expect(createCompanyService).toBeCalledTimes(1);
        expect(createCompanyService).toHaveBeenCalledWith({
          name: dummyCompanyName1,
        });
      });

      test("ステータスコード 201 となり、作成されたデータが返ること", () => {
        expect(result).toEqual({
          statusCode: 201,
          body: JSON.stringify(dummyCompanyItem1),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            Location: `/companies/${dummyCompanyId1}`,
          },
        });
      });
    });

    describe("CompaniesTableAlreadyExistsError をキャッチした場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        createCompanyServiceMock.mockRejectedValue(
          new CompaniesTableAlreadyExistsError(
            "dummy-tableName",
            dummyCompanyItem1,
          ),
        );

        result = await companiesIdPostHandler(
          mockReq({
            body: { name: dummyCompanyName1 },
          }),
        );
      });

      test("createCompanyService の呼び出しが期待通り行われること", () => {
        expect(createCompanyService).toBeCalledTimes(1);
        expect(createCompanyService).toHaveBeenCalledWith({
          name: dummyCompanyName1,
        });
      });

      test("ステータスコード 409 が返ること", () => {
        expect(result).toEqual({
          statusCode: 409,
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
          },
        });
      });
    });

    describe("CompanyServiceUnknownError をキャッチした場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        createCompanyServiceMock.mockRejectedValue(CompanyServiceUnknownError);

        result = await companiesIdPostHandler(
          mockReq({
            body: { name: dummyCompanyName1 },
          }),
        );
      });

      test("createCompanyService の呼び出しが期待通り行われること", () => {
        expect(createCompanyService).toBeCalledTimes(1);
        expect(createCompanyService).toHaveBeenCalledWith({
          name: dummyCompanyName1,
        });
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

  describe("Event データの body プロパティが undefined の場合", () => {
    test("ステータスコード 400 が返ること", async () => {
      const result = await companiesIdPostHandler(mockReq({}));

      expect(createCompanyService).toBeCalledTimes(0);

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

  describe("Event データの body プロパティが null の場合", () => {
    test("ステータスコード 400 が返ること", async () => {
      const result = await companiesIdPostHandler(
        mockReq({
          body: null,
        }),
      );

      expect(createCompanyService).toBeCalledTimes(0);

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

  describe("Event データの body プロパティがスキーマ不正の場合", () => {
    test("ステータスコード 400 が返ること", async () => {
      const result = await companiesIdPostHandler(
        mockReq({
          body: JSON.stringify({}),
        }),
      );

      expect(createCompanyService).toBeCalledTimes(0);

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
