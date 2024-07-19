import {
  CompanyServiceNotExistsError,
  CompanyServiceUnknownError,
} from "@/lambda/domains/errors/company-service";
import { deleteItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import { CompaniesTableNotExistsError } from "@/lambda/infrastructures/errors/companies-table";

/**
 * 会社削除サービス
 * @param id 会社 ID
 * @throws CompanyServiceNotExistsError (指定した ID の会社が存在しない場合)
 * @throws CompanyServiceUnknownError (未知のエラーが発生した場合)
 * @return なし
 */
export const deleteCompanyService = async (id: string): Promise<void> => {
  try {
    await deleteItem(id);
  } catch (e) {
    if (e instanceof CompaniesTableNotExistsError) {
      throw new CompanyServiceNotExistsError(id);
    }
    throw new CompanyServiceUnknownError(e);
  }
};
