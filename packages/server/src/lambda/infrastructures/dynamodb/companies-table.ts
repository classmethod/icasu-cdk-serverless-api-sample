import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { paginateQuery, paginateScan } from "@aws-sdk/lib-dynamodb";

import { dynamoDBDocument } from "@/lambda/infrastructures/dynamodb/client";
import {
  CompaniesTableAlreadyExistsError,
  CompaniesTableNotExistsError,
  CompaniesTableUnknownError,
} from "@/lambda/infrastructures/errors/companies-table";

const COMPANIES_TABLE_NAME = process.env.COMPANIES_TABLE_NAME || "";
const COMPANIES_TABLE_INDUSTRY_CREATED_AT_INDEX_NAME =
  process.env.COMPANIES_TABLE_INDUSTRY_CREATED_AT_INDEX_NAME || "";

export type Industry = "IT" | "Manufacturing" | "Finance" | "Medical" | "Other";

export interface CompanyItem {
  id: string;
  createdAt: number;
  name: string;
  industry?: Industry;
}

/**
 * 会社テーブルにアイテムをプットする
 * @param company 会社アイテム
 * @throws CompaniesTableAlreadyExistsError (会社アイテムが既に存在する場合)
 * @throws CompaniesTableUnknownError (未知のエラーが発生した場合)
 * @return なし
 */
export const putItem = async (company: CompanyItem): Promise<void> => {
  try {
    await dynamoDBDocument.put({
      TableName: COMPANIES_TABLE_NAME,
      Item: company,
      ConditionExpression: "attribute_not_exists(id)",
    });
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException) {
      throw new CompaniesTableAlreadyExistsError(COMPANIES_TABLE_NAME, company);
    }

    throw new CompaniesTableUnknownError(COMPANIES_TABLE_NAME, e);
  }
};

/**
 * 会社テーブルからアイテムを取得する
 * @param id 会社アイテムの ID
 * @throws CompaniesTableNotExistsError (会社アイテムが存在しない場合)
 * @throws CompaniesTableUnknownError (未知のエラーが発生した場合)
 * @return 会社アイテム
 */
export const getItem = async (id: string): Promise<CompanyItem | null> => {
  try {
    const result = await dynamoDBDocument.get({
      TableName: COMPANIES_TABLE_NAME,
      Key: { id },
    });

    if (result.Item === undefined) {
      return null;
    }

    return result.Item as CompanyItem;
  } catch (e) {
    throw new CompaniesTableUnknownError(COMPANIES_TABLE_NAME, e);
  }
};

/**
 * 会社テーブルからアイテムを削除する
 * @param id 会社アイテムの ID
 * @throws CompaniesTableNotExistsError (会社アイテムが存在しない場合)
 * @throws CompaniesTableUnknownError (未知のエラーが発生した場合)
 * @return なし
 */
export const deleteItem = async (id: string): Promise<void> => {
  try {
    await dynamoDBDocument.delete({
      TableName: COMPANIES_TABLE_NAME,
      Key: { id },
      ConditionExpression: "attribute_exists(id)",
    });
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException) {
      throw new CompaniesTableNotExistsError(COMPANIES_TABLE_NAME, id);
    }

    throw new CompaniesTableUnknownError(COMPANIES_TABLE_NAME, e);
  }
};

/**
 * 会社テーブルをページネーションスキャンする
 * @see https://github.com/aws/aws-sdk-js-v3#paginators
 * @throws CompaniesTableUnknownError (未知のエラーが発生した場合)
 * @return 会社アイテムの配列
 */
export const paginateScanItem = async (): Promise<CompanyItem[]> => {
  const paginator = paginateScan(
    {
      client: dynamoDBDocument,
    },
    {
      TableName: COMPANIES_TABLE_NAME,
    },
  );
  const companies: CompanyItem[] = [];

  try {
    for await (const page of paginator) {
      companies.push(...(page.Items as CompanyItem[]));
    }

    return companies;
  } catch (e) {
    throw new CompaniesTableUnknownError(COMPANIES_TABLE_NAME, e as Error);
  }
};

/**
 * 会社テーブルをページネーションクエリする
 * @see https://github.com/aws/aws-sdk-js-v3#paginators
 * @param industry 業種
 * @param createdAfter 作成日時の開始
 * @param createdBefore 作成日時の終了
 * @throws CompaniesTableUnknownError (未知のエラーが発生した場合)
 * @return 会社アイテムの配列
 */
export const paginateQueryItem = async (
  industry: Industry,
  createdAfter?: number,
  createdBefore?: number,
  // ScanIndexForward?: boolean, // TODO: ソート機能を別途実装
): Promise<CompanyItem[]> => {
  const [
    addKeyConditionExpression,
    addExpressionAttributeValues,
    addExpressionAttributeNames,
  ] = ((_createdAfter, _createdBefore) => {
    if (_createdAfter && _createdBefore) {
      return [
        " AND (#createdAt BETWEEN :createdAfter AND :createdBefore)",
        {
          ":createdAfter": _createdAfter,
          ":createdBefore": _createdBefore,
        },
        { "#createdAt": "createdAt" },
      ];
    } else if (_createdAfter) {
      return [
        " AND #createdAt >= :createdAfter",
        { ":createdAfter": _createdAfter },
        { "#createdAt": "createdAt" },
      ];
    } else if (_createdBefore) {
      return [
        " AND #createdAt <= :createdBefore",
        { ":createdBefore": _createdBefore },
        { "#createdAt": "createdAt" },
      ];
    } else {
      return ["", {}, {}];
    }
  })(createdAfter, createdBefore);

  const paginator = paginateQuery(
    {
      client: dynamoDBDocument,
    },
    {
      TableName: COMPANIES_TABLE_NAME,
      IndexName: COMPANIES_TABLE_INDUSTRY_CREATED_AT_INDEX_NAME,
      KeyConditionExpression: `#industry = :industry${addKeyConditionExpression}`,
      ExpressionAttributeValues: {
        ":industry": industry,
        ...addExpressionAttributeValues,
      },
      ExpressionAttributeNames: {
        "#industry": "industry",
        ...addExpressionAttributeNames,
      },
    },
  );
  const companies: CompanyItem[] = [];

  try {
    for await (const page of paginator) {
      companies.push(...(page.Items as CompanyItem[]));
    }

    return companies;
  } catch (e) {
    throw new CompaniesTableUnknownError(COMPANIES_TABLE_NAME, e as Error);
  }
};
