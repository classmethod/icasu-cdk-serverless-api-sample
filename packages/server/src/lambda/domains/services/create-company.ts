import { Company } from "./schemas";
import { CompanyServiceUnknownError } from "@/lambda/domains/errors/company-service";
import { putItem } from "@/lambda/infrastructures/dynamodb/companies-table";
import { CompaniesTableAlreadyExistsError } from "@/lambda/infrastructures/errors/companies-table";
import { getCurrentUnixTimestampMillis } from "@/utils/datetime";
import { generateUuidV4 } from "@/utils/uuid";

export interface CreateCompanyProps {
  name: string;
}

/**
 * 会社作成サービス
 * @param createCompanyProps 作成する会社のプロパティ
 * @throws CompaniesTableAlreadyExistsError (作成を試みた会社が既に存在する場合)
 * @throws CompanyServiceUnknownError (未知のエラーが発生した場合)
 * @return 作成した会社
 */
export const createCompanyService = async (
  createCompanyProps: CreateCompanyProps,
): Promise<Company> => {
  const id = generateUuidV4();
  const createdAt = getCurrentUnixTimestampMillis();

  try {
    const createdCompany = { id, createdAt, ...createCompanyProps };

    await putItem(createdCompany);

    return createdCompany;
  } catch (e) {
    if (e instanceof CompaniesTableAlreadyExistsError) {
      throw e;
    }

    throw new CompanyServiceUnknownError(e);
  }
};
