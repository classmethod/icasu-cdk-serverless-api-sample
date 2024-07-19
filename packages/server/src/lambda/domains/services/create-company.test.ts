import { createCompanyService } from "./create-company";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { putItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import {
  CompaniesTableAlreadyExistsError,
  CompaniesTableUnknownError,
} from "@/lambda/infrastructures/errors/companies-table";

/**
 * すべての vi.mock がファイルの先頭で実行される（最後のモックが優先される）仕様のワークアラウンド
 * @see https://zenn.dev/you_5805/articles/vitest-mock-hoisting https://vitest.dev/api/vi#vi-hoisted-0-31-0
 */
const { putItemMock, v4Mock } = vi.hoisted(() => {
  return {
    putItemMock: vi.fn(),
    v4Mock: vi.fn(),
  };
});
vi.mock("uuid", () => {
  return {
    v4: v4Mock,
  };
});
vi.mock("@/lambda/infrastructures/dynamodb/companies-table", () => {
  return {
    putItem: putItemMock,
  };
});

const fakeTime = new Date("2024-01-01T00:00:00+09:00");
const fakeTimestamp = fakeTime.getTime();

vi.useFakeTimers();
vi.setSystemTime(fakeTime);

describe("createCompanyService", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyCompanyId1 = "e3162725-4b5b-4779-bf13-14d55d63a584";
  const dummyCompanyName1 = "dummy-name-1";
  const dummyCompanyItem1 = {
    id: dummyCompanyId1,
    createdAt: fakeTimestamp,
    name: dummyCompanyName1,
  };

  describe("実行が正常に行われた場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      v4Mock.mockReturnValue(dummyCompanyId1);
      putItemMock.mockResolvedValue(void 0);

      result = await createCompanyService({ name: dummyCompanyName1 });
    });

    test("putItem の呼び出しが期待通り行われること", () => {
      expect(putItem).toBeCalledTimes(1);
      expect(putItem).toHaveBeenCalledWith(dummyCompanyItem1);
    });

    test("作成された会社データが返されること", () => {
      expect(result).toEqual(dummyCompanyItem1);
    });
  });

  describe("CompaniesTableAlreadyExistsError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      v4Mock.mockReturnValue(dummyCompanyId1);
      putItemMock.mockRejectedValue(CompaniesTableAlreadyExistsError);

      result = createCompanyService({ name: dummyCompanyName1 }); // Promise を作成
    });

    test("CompaniesTableAlreadyExistsError がスローされること", async () => {
      // NOTE: 非同期関数の rejects をアサーションする場合は Promise を指定して await で待機する。（待機しない場合は偽陽性となる可能性がある）
      // @see https://vitest.dev/api/expect#rejects
      await expect(result).rejects.toThrowError(
        new CompaniesTableAlreadyExistsError(
          "dummy-tableName",
          dummyCompanyItem1,
        ),
      );

      // putItem の呼び出しが期待通り行われること
      // NOTE: Promise を rejects でアサーションする場合は、実行が前後する可能性があるため、呼び出しのアサーションも rejects と同じ test ブロック内で行う必要がある。
      expect(putItem).toBeCalledTimes(1);
      expect(putItem).toHaveBeenCalledWith(dummyCompanyItem1);
    });
  });

  describe("CompaniesTableUnknownError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      v4Mock.mockReturnValue(dummyCompanyId1);
      putItemMock.mockRejectedValue(CompaniesTableUnknownError);

      result = createCompanyService({ name: dummyCompanyName1 }); // Promise を作成
    });

    test("CompanyServiceUnknownError がスローされること", async () => {
      await expect(result).rejects.toThrowError(CompanyServiceUnknownError);

      // putItem の呼び出しが期待通り行われること
      expect(putItem).toBeCalledTimes(1);
      expect(putItem).toHaveBeenCalledWith(dummyCompanyItem1);
    });
  });
});
