import { getCompanyService } from "./get-company";
import {
  CompanyServiceNotExistsError,
  CompanyServiceUnknownError,
} from "@/lambda/domains/errors/company-service";
import { getItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import { CompaniesTableUnknownError } from "@/lambda/infrastructures/errors/companies-table";

/**
 * すべての vi.mock がファイルの先頭で実行される（最後のモックが優先される）仕様のワークアラウンド
 * @see https://zenn.dev/you_5805/articles/vitest-mock-hoisting https://vitest.dev/api/vi#vi-hoisted-0-31-0
 */
const { getItemMock } = vi.hoisted(() => {
  return {
    getItemMock: vi.fn(),
  };
});
vi.mock("@/lambda/infrastructures/dynamodb/companies-table", () => {
  return {
    getItem: getItemMock,
  };
});

describe("getCompanyService", () => {
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

  describe("実行が正常に行われた場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      getItemMock.mockResolvedValue(dummyCompanyItem1);

      result = await getCompanyService(dummyCompanyId1);
    });

    test("getItem の呼び出しが期待通り行われること", () => {
      expect(getItem).toBeCalledTimes(1);
      expect(getItem).toHaveBeenCalledWith(dummyCompanyId1);
    });

    test("取得された会社データが返されること", () => {
      expect(result).toEqual(dummyCompanyItem1);
    });
  });

  describe("CompaniesTableNotExistsError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      getItemMock.mockResolvedValue(null);

      result = getCompanyService(dummyCompanyId1); // Promise を作成
    });

    test("CompanyServiceNotExistsError がスローされること", async () => {
      // NOTE: 非同期関数の rejects をアサーションする場合は Promise を指定して await で待機する。（待機しない場合は偽陽性となる可能性がある）
      // @see https://vitest.dev/api/expect#rejects
      await expect(result).rejects.toThrowError(
        new CompanyServiceNotExistsError(dummyCompanyId1),
      );

      // getItem の呼び出しが期待通り行われること
      // NOTE: Promise を rejects でアサーションする場合は、実行が前後する可能性があるため、呼び出しのアサーションも rejects と同じ test ブロック内で行う必要がある。
      expect(getItem).toBeCalledTimes(1);
      expect(getItem).toHaveBeenCalledWith(dummyCompanyId1);
    });
  });

  describe("CompaniesTableUnknownError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      getItemMock.mockRejectedValue(CompaniesTableUnknownError);

      result = getCompanyService(dummyCompanyId1); // Promise を作成
    });

    test("CompanyServiceUnknownError がスローされること", async () => {
      // NOTE: 非同期関数の rejects をアサーションする場合は Promise を指定して await で待機する。（待機しない場合は偽陽性となる可能性がある）
      // @see https://vitest.dev/api/expect#rejects
      await expect(result).rejects.toThrowError(CompanyServiceUnknownError);

      // getItem の呼び出しが期待通り行われること
      // NOTE: Promise を rejects でアサーションする場合は、実行が前後する可能性があるため、呼び出しのアサーションも rejects と同じ test ブロック内で行う必要がある。
      expect(getItem).toBeCalledTimes(1);
      expect(getItem).toHaveBeenCalledWith(dummyCompanyId1);
    });
  });
});
