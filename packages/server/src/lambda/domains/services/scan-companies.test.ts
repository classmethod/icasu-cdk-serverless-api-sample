import { scanCompaniesService } from "./scan-companies";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { paginateScanItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import { CompaniesTableUnknownError } from "@/lambda/infrastructures/errors/companies-table";

/**
 * すべての vi.mock がファイルの先頭で実行される（最後のモックが優先される）仕様のワークアラウンド
 * @see https://zenn.dev/you_5805/articles/vitest-mock-hoisting https://vitest.dev/api/vi#vi-hoisted-0-31-0
 */
const { paginateScanItemMock } = vi.hoisted(() => {
  return {
    paginateScanItemMock: vi.fn(),
  };
});
vi.mock("@/lambda/infrastructures/dynamodb/companies-table", () => {
  return {
    paginateScanItem: paginateScanItemMock,
  };
});

describe("scanCompaniesService", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const dummyTimestamp1 = new Date("2024-01-01T00:00:00+09:00").getTime();
  const dummyTimestamp2 = new Date("2024-07-07T00:00:00+09:00").getTime();
  const dummyTimestamp3 = new Date("2025-03-31T00:00:00+09:00").getTime();

  describe("実行が正常に行われた場合", () => {
    const dummyCompany1 = {
      id: "e3162725-4b5b-4779-bf13-14d55d63a584",
      createdAt: dummyTimestamp1,
      name: "dummy-name-1",
    };
    const dummyCompany2 = {
      id: "122db705-3791-289e-042c-740bec3add55",
      createdAt: dummyTimestamp2,
      name: "dummy-name-2",
    };
    const dummyCompany3 = {
      id: "e3162725-4b5b-4779-bf13-14d55d63a585",
      createdAt: dummyTimestamp3,
      name: "dummy-name-3",
    };

    describe("引数で maxItems が指定されていない場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        paginateScanItemMock.mockResolvedValue([
          dummyCompany1,
          dummyCompany2,
          dummyCompany3,
        ]);

        result = await scanCompaniesService();
      });

      test("paginateScanItem の呼び出しが期待通り行われること", () => {
        expect(paginateScanItem).toBeCalledTimes(1);
        expect(paginateScanItem).toHaveBeenCalledWith();
      });

      test("取得された会社データが返されること", () => {
        expect(result).toEqual([dummyCompany1, dummyCompany2, dummyCompany3]);
      });
    });

    describe("引数で maxItems が指定されている場合", () => {
      describe("取得されたアイテム数が maxItems より大きい場合", () => {
        let result: unknown = undefined;

        beforeAll(async () => {
          paginateScanItemMock.mockResolvedValue([
            dummyCompany1,
            dummyCompany2,
            dummyCompany3,
          ]);

          result = await scanCompaniesService({ maxItems: 2 });
        });

        test("paginateScanItem の呼び出しが期待通り行われること", () => {
          expect(paginateScanItem).toBeCalledTimes(1);
          expect(paginateScanItem).toHaveBeenCalledWith();
        });

        test("maxItems を最大とした一部の会社データが返されること", () => {
          expect(result).toEqual([dummyCompany1, dummyCompany2]);
        });
      });

      describe("取得されたアイテム数が maxItems より小さい場合", () => {
        let result: unknown = undefined;

        beforeAll(async () => {
          paginateScanItemMock.mockResolvedValue([dummyCompany1]);

          result = await scanCompaniesService({ maxItems: 2 });
        });

        test("paginateScanItem の呼び出しが期待通り行われること", () => {
          expect(paginateScanItem).toBeCalledTimes(1);
          expect(paginateScanItem).toHaveBeenCalledWith();
        });

        test("すべての会社データが返されること", () => {
          expect(result).toEqual([dummyCompany1]);
        });
      });
    });
  });

  describe("CompaniesTableUnknownError をキャッチした場合", () => {
    let result: unknown = undefined;

    beforeAll(async () => {
      paginateScanItemMock.mockRejectedValue(CompaniesTableUnknownError);

      result = scanCompaniesService(); // Promise を作成
    });

    test("CompanyServiceUnknownError がスローされること", async () => {
      // NOTE: 非同期関数の rejects をアサーションする場合は Promise を指定して await で待機する。（待機しない場合は偽陽性となる可能性がある）
      // @see https://vitest.dev/api/expect#rejects
      await expect(result).rejects.toThrowError(CompanyServiceUnknownError);

      // paginateScanItem の呼び出しが期待通り行われること
      // NOTE: Promise を rejects でアサーションする場合は、実行が前後する可能性があるため、呼び出しのアサーションも rejects と同じ test ブロック内で行う必要がある。
      expect(paginateScanItem).toBeCalledTimes(1);
      expect(paginateScanItem).toHaveBeenCalledWith();
    });
  });
});
