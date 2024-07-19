import { mockReq } from "sinon-express-mock";
import { companiesIdDeleteHandler } from "./companies-id-delete";
import {
  CompanyServiceNotExistsError,
  CompanyServiceUnknownError,
} from "@/lambda/domains/errors/company-service";
import { deleteCompanyService } from "@/lambda/domains/services/delete-company";

/**
 * すべての vi.mock がファイルの先頭で実行される（最後のモックが優先される）仕様のワークアラウンド
 * @see https://zenn.dev/you_5805/articles/vitest-mock-hoisting https://vitest.dev/api/vi#vi-hoisted-0-31-0
 */
const { deleteCompanyServiceMock } = vi.hoisted(() => {
  return {
    deleteCompanyServiceMock: vi.fn(),
  };
});
vi.mock("@/lambda/domains/services/delete-company", () => {
  return {
    deleteCompanyService: deleteCompanyServiceMock,
  };
});

describe("companiesIdDeleteHandler", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyCompanyId1 = "e3162725-4b5b-4779-bf13-14d55d63a584";

  describe("正常な ID がパスパラメーターで渡された場合", () => {
    describe("実行が正常に行われた場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        deleteCompanyServiceMock.mockResolvedValue(void 0);

        result = await companiesIdDeleteHandler(
          mockReq({
            params: { id: dummyCompanyId1 },
          }),
        );
      });

      test("deleteCompanyService の呼び出しが期待通り行われること", () => {
        expect(deleteCompanyService).toBeCalledTimes(1);
        expect(deleteCompanyService).toHaveBeenCalledWith(dummyCompanyId1);
      });

      test("ステータスコード 204 が返ること", () => {
        expect(result).toEqual({
          statusCode: 204,
          headers: {
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
            "Access-Control-Allow-Origin": "*",
          },
        });
      });
    });

    describe("CompanyServiceNotExistsError をキャッチした場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        deleteCompanyServiceMock.mockRejectedValue(
          new CompanyServiceNotExistsError(dummyCompanyId1),
        );

        result = await companiesIdDeleteHandler(
          mockReq({
            params: { id: dummyCompanyId1 },
          }),
        ); // Promise を作成
      });

      test("deleteCompanyService の呼び出しが期待通り行われること", () => {
        expect(deleteCompanyService).toBeCalledTimes(1);
        expect(deleteCompanyService).toHaveBeenCalledWith(dummyCompanyId1);
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
        deleteCompanyServiceMock.mockRejectedValue(CompanyServiceUnknownError);

        result = await companiesIdDeleteHandler(
          mockReq({
            params: { id: dummyCompanyId1 },
          }),
        ); // Promise を作成
      });

      test("deleteCompanyService の呼び出しが期待通り行われること", () => {
        expect(deleteCompanyService).toBeCalledTimes(1);
        expect(deleteCompanyService).toHaveBeenCalledWith(dummyCompanyId1);
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
    const invalidFormatId = "invalid_id";

    beforeAll(async () => {
      result = await companiesIdDeleteHandler(
        mockReq({
          params: { id: invalidFormatId },
        }),
      );
    });

    test("deleteCompanyService が呼び出されないこと", () => {
      expect(deleteCompanyService).toBeCalledTimes(0);
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
