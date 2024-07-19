import { Company } from "./schemas";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { paginateScanItem } from "@/lambda/infrastructures/dynamodb/companies-table";

interface ScanCompaniesParams {
  maxItems?: number;
}

/**
 * 会社スキャンサービス
 * @param params
 * @returns 会社一覧
 */
export const scanCompaniesService = async (
  params?: ScanCompaniesParams,
): Promise<Company[]> => {
  try {
    const companies = await paginateScanItem();

    // NOTE: 必要に応じてソート処理を追加する

    if (params !== undefined && params.maxItems !== undefined) {
      return companies.slice(0, params.maxItems);
    }

    return companies;
  } catch (e) {
    throw new CompanyServiceUnknownError(e);
  }
};
