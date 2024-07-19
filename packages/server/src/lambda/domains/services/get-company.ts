import { Company } from "./schemas";
import {
  CompanyServiceNotExistsError,
  CompanyServiceUnknownError,
} from "@/lambda/domains/errors/company-service";
import { getItem } from "@/lambda/infrastructures/dynamodb/companies-table";

/**
 * 会社取得サービス
 * @param id 会社 ID
 * @throws CompanyServiceNotExistsError (指定した ID の会社が存在しない場合)
 * @throws CompanyServiceUnknownError (未知のエラーが発生した場合)
 * @returns 会社
 */
export const getCompanyService = async (id: string): Promise<Company> => {
  try {
    const company = await getItem(id);

    if (company === null) {
      throw new CompanyServiceNotExistsError(id);
    }

    return company;
  } catch (e) {
    if (e instanceof CompanyServiceNotExistsError) {
      throw e;
    }
    throw new CompanyServiceUnknownError(e);
  }
};
