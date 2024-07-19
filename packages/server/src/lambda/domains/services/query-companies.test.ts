import { queryCompaniesService } from "./query-companies";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { paginateQueryItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import { CompaniesTableUnknownError } from "@/lambda/infrastructures/errors/companies-table";

const { paginateQueryItemMock } = vi.hoisted(() => {
  return {
    paginateQueryItemMock: vi.fn(),
  };
});
vi.mock("@/lambda/infrastructures/dynamodb/companies-table", () => {
  return {
    paginateQueryItem: paginateQueryItemMock,
  };
});

describe("queryCompaniesService", () => {
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
      industry: "IT",
    };
    const dummyCompany2 = {
      id: "122db705-3791-289e-042c-740bec3add55",
      createdAt: dummyTimestamp2,
      name: "dummy-name-2",
      industry: "Manufacturing",
    };
    const dummyCompany3 = {
      id: "e3162725-4b5b-4779-bf13-14d55d63a585",
      createdAt: dummyTimestamp3,
      name: "dummy-name-3",
      industry: "Other",
    };

    describe("引数で createdAfter と createdBefore が指定されている場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        paginateQueryItemMock.mockResolvedValue([
          dummyCompany1,
          dummyCompany2,
          dummyCompany3,
        ]);

        result = await queryCompaniesService(
          "IT",
          dummyTimestamp1,
          dummyTimestamp3,
        );
      });

      test("paginateQueryItem の呼び出しが期待通り行われること", () => {
        expect(paginateQueryItem).toBeCalledTimes(1);
        expect(paginateQueryItem).toHaveBeenCalledWith(
          "IT",
          dummyTimestamp1,
          dummyTimestamp3,
        );
      });

      test("取得された会社データが返されること", () => {
        expect(result).toEqual([dummyCompany1, dummyCompany2, dummyCompany3]);
      });
    });

    describe("引数で maxItems が指定されていない場合", () => {
      let result: unknown = undefined;

      beforeAll(async () => {
        paginateQueryItemMock.mockResolvedValue([
          dummyCompany1,
          dummyCompany2,
          dummyCompany3,
        ]);

        result = await queryCompaniesService("IT");
      });

      test("paginateQueryItem の呼び出しが期待通り行われること", () => {
        expect(paginateQueryItem).toBeCalledTimes(1);
        expect(paginateQueryItem).toHaveBeenCalledWith(
          "IT",
          undefined,
          undefined,
        );
      });

      test("取得された会社データが返されること", () => {
        expect(result).toEqual([dummyCompany1, dummyCompany2, dummyCompany3]);
      });
    });

    describe("引数で maxItems が指定されている場合", () => {
      describe("取得されたアイテム数が maxItems より大きい場合", () => {
        let result: unknown = undefined;

        beforeAll(async () => {
          paginateQueryItemMock.mockResolvedValue([
            dummyCompany1,
            dummyCompany2,
            dummyCompany3,
          ]);

          result = await queryCompaniesService("IT", undefined, undefined, 2);
        });

        test("paginateQueryItem の呼び出しが期待通り行われること", () => {
          expect(paginateQueryItem).toBeCalledTimes(1);
          expect(paginateQueryItem).toHaveBeenCalledWith(
            "IT",
            undefined,
            undefined,
          );
        });

        test("maxItems を最大とした一部の会社データが返されること", () => {
          expect(result).toEqual([dummyCompany1, dummyCompany2]);
        });
      });

      describe("取得されたアイテム数が maxItems より小さい場合", () => {
        let result: unknown = undefined;

        beforeAll(async () => {
          paginateQueryItemMock.mockResolvedValue([dummyCompany1]);

          result = await queryCompaniesService("IT", undefined, undefined, 2);
        });

        test("paginateQueryItem の呼び出しが期待通り行われること", () => {
          expect(paginateQueryItem).toBeCalledTimes(1);
          expect(paginateQueryItem).toHaveBeenCalledWith(
            "IT",
            undefined,
            undefined,
          );
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
      paginateQueryItemMock.mockRejectedValue(CompaniesTableUnknownError);

      result = queryCompaniesService("IT"); // Promise を作成
    });

    test("CompanyServiceUnknownError がスローされること", async () => {
      await expect(result).rejects.toThrowError(CompanyServiceUnknownError);

      expect(paginateQueryItem).toBeCalledTimes(1);
      expect(paginateQueryItem).toHaveBeenCalledWith(
        "IT",
        undefined,
        undefined,
      );
    });
  });
});
