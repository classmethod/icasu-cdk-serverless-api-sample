import { deleteCompanyService } from "./delete-company";
import {
  CompanyServiceNotExistsError,
  CompanyServiceUnknownError,
} from "@/lambda/domains/errors/company-service";
import { deleteItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import {
  CompaniesTableNotExistsError,
  CompaniesTableUnknownError,
} from "@/lambda/infrastructures/errors/companies-table";

/**
 * すべての vi.mock がファイルの先頭で実行される（最後のモックが優先される）仕様のワークアラウンド
 * @see https://zenn.dev/you_5805/articles/vitest-mock-hoisting https://vitest.dev/api/vi#vi-hoisted-0-31-0
 */
const { deleteItemMock } = vi.hoisted(() => {
  return {
    deleteItemMock: vi.fn(),
  };
});
vi.mock("@/lambda/infrastructures/dynamodb/companies-table", () => {
  return {
    deleteItem: deleteItemMock,
  };
});

describe("deleteCompanyService", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyCompanyId1 = "e3162725-4b5b-4779-bf13-14d55d63a584";

  describe("実行が正常に行われた場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      deleteItemMock.mockResolvedValue(undefined);

      await deleteCompanyService(dummyCompanyId1);
    });

    test("deleteItem の呼び出しが期待通り行われること", () => {
      expect(deleteItem).toBeCalledTimes(1);
      expect(deleteItem).toHaveBeenCalledWith(dummyCompanyId1);
    });

    test("何も返されないこと", () => {
      expect(result).toBeUndefined();
    });
  });

  describe("CompaniesTableNotExistsError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      deleteItemMock.mockRejectedValue(CompaniesTableNotExistsError);

      result = deleteCompanyService(dummyCompanyId1); // Promise を作成
    });

    test("CompanyServiceNotExistsError が throw されること", async () => {
      // NOTE: 非同期関数の rejects をアサーションする場合は Promise を指定して await で待機する。（待機しない場合は偽陽性となる可能性がある）
      // @see https://vitest.dev/api/expect#rejects
      await expect(result).rejects.toThrowError(
        new CompanyServiceNotExistsError(dummyCompanyId1),
      );

      // getItem の呼び出しが期待通り行われること
      // NOTE: Promise を rejects でアサーションする場合は、実行が前後する可能性があるため、呼び出しのアサーションも rejects と同じ test ブロック内で行う必要がある。
      expect(deleteItem).toBeCalledTimes(1);
      expect(deleteItem).toHaveBeenCalledWith(dummyCompanyId1);
    });
  });

  describe("CompaniesTableUnknownError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      deleteItemMock.mockRejectedValue(CompaniesTableUnknownError);

      result = deleteCompanyService(dummyCompanyId1); // Promise を作成
    });

    test("CompanyServiceUnknownError が throw されること", async () => {
      // NOTE: 非同期関数の rejects をアサーションする場合は Promise を指定して await で待機する。（待機しない場合は偽陽性となる可能性がある）
      // @see https://vitest.dev/api/expect#rejects
      await expect(result).rejects.toThrowError(CompanyServiceUnknownError);

      // getItem の呼び出しが期待通り行われること
      // NOTE: Promise を rejects でアサーションする場合は、実行が前後する可能性があるため、呼び出しのアサーションも rejects と同じ test ブロック内で行う必要がある。
      expect(deleteItem).toBeCalledTimes(1);
      expect(deleteItem).toHaveBeenCalledWith(dummyCompanyId1);
    });
  });
});
