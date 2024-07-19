import { Company, Industry } from "./schemas";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { paginateQueryItem } from "@/lambda/infrastructures/dynamodb/companies-table";

/**
 * 会社クエリサービス
 * @param industry 業種
 * @param createdAfter 作成日時の開始
 * @param createdBefore 作成日時の終了
 * @param maxItems 最大アイテム数
 * @throws CompanyServiceUnknownError (未知のエラーが発生した場合)
 * @return 会社一覧
 */
export const queryCompaniesService = async (
  industry: Industry,
  createdAfter?: number,
  createdBefore?: number,
  maxItems?: number,
): Promise<Company[]> => {
  try {
    const companies = await paginateQueryItem(
      industry,
      createdAfter,
      createdBefore,
    );

    if (maxItems !== undefined) {
      return companies.slice(0, maxItems);
    }

    return companies;
  } catch (e) {
    throw new CompanyServiceUnknownError(e);
  }
};
