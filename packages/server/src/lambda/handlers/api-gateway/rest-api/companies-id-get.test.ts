import { mockReq } from "sinon-express-mock";
import { companiesIdGetHandler } from "./companies-id-get";
import {
  CompanyServiceNotExistsError,
  CompanyServiceUnknownError,
} from "@/lambda/domains/errors/company-service";
import { getCompanyService } from "@/lambda/domains/services/get-company";

const { getCompanyServiceMock } = vi.hoisted(() => {
  return {
    getCompanyServiceMock: vi.fn(),
  };
});
vi.mock("@/lambda/domains/services/get-company", () => {
  return {
    getCompanyService: getCompanyServiceMock,
  };
});

describe("companiesIdGetHandler", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyCompanyId1 = "e3162725-4b5b-4779-bf13-14d55d63a584";
  const dummyTimestamp1 = new Date("2024-01-01T00:00:00+09:00").getTime();

  const dummyCompanyItem1 = {
    id: dummyCompanyId1,
    createdAt: dummyTimestamp1,
    name: "dummy-name-1",
  };

  describe("正常な ID がパスパラメーターで渡された場合", () => {
    describe("実行が正常に行われた場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        getCompanyServiceMock.mockResolvedValue(dummyCompanyItem1);

        result = await companiesIdGetHandler(
          mockReq({
            params: { id: dummyCompanyId1 },
          }),
        );
      });

      test("getCompanyService の呼び出しが期待通り行われること", () => {
        expect(getCompanyService).toBeCalledTimes(1);
        expect(getCompanyService).toHaveBeenCalledWith(dummyCompanyId1);
      });

      test("ステータスコード 200 となり、データが返ること", () => {
        expect(result).toEqual({
          statusCode: 200,
          body: JSON.stringify(dummyCompanyItem1),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      });
    });

    describe("CompanyServiceNotExistsError をキャッチした場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        getCompanyServiceMock.mockRejectedValue(
          new CompanyServiceNotExistsError(dummyCompanyId1),
        );

        result = await companiesIdGetHandler(
          mockReq({
            params: { id: dummyCompanyId1 },
          }),
        );
      });

      test("getCompanyService の呼び出しが期待通り行われること", () => {
        expect(getCompanyService).toBeCalledTimes(1);
        expect(getCompanyService).toHaveBeenCalledWith(dummyCompanyId1);
      });

      test("ステータスコード 404 が返ること", () => {
        expect(result).toEqual({
          statusCode: 404,
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
        getCompanyServiceMock.mockRejectedValue(CompanyServiceUnknownError);

        result = await companiesIdGetHandler(
          mockReq({
            params: { id: dummyCompanyId1 },
          }),
        );
      });

      test("getCompanyService の呼び出しが期待通り行われること", () => {
        expect(getCompanyService).toBeCalledTimes(1);
        expect(getCompanyService).toHaveBeenCalledWith(dummyCompanyId1);
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

  describe("不正な ID がパスパラメーターで渡された場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      result = await companiesIdGetHandler(
        mockReq({
          params: { id: "invalid_id" },
        }),
      );
    });

    test("ステータスコード 400 が返ること", () => {
      expect(getCompanyService).toBeCalledTimes(0);

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
