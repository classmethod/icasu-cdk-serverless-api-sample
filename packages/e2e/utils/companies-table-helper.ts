import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocument,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: "ap-northeast-1",
});
const dynamoDBDocument = DynamoDBDocument.from(dynamoClient);

export type Industry = "IT" | "Manufacturing" | "Finance" | "Medical" | "Other";

export interface Company {
  id: string;
  name: string;
  createdAt: number;
  industry?: Industry;
}

const COMPANIES_TABLE_NAME = process.env.COMPANIES_TABLE_NAME || "";

export const getCompany = async (id: string): Promise<Company | undefined> => {
  const result = await dynamoDBDocument.send(
    new GetCommand({
      TableName: COMPANIES_TABLE_NAME,
      Key: {
        id: id,
      },
    }),
  );
  return result.Item as Company;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await dynamoDBDocument.send(
    new DeleteCommand({
      TableName: COMPANIES_TABLE_NAME,
      Key: {
        id: id,
      },
    }),
  );
};

export const listCompanies = async (): Promise<Company[]> => {
  const result = await dynamoDBDocument.send(
    new ScanCommand({
      TableName: COMPANIES_TABLE_NAME,
    }),
  );
  return result.Items as Company[];
};

export const putCompany = async (company: {
  id: string;
  createdAt: number;
  name: string;
}): Promise<void> => {
  await dynamoDBDocument.send(
    new PutCommand({
      TableName: COMPANIES_TABLE_NAME,
      Item: company,
    }),
  );
};

export const companyIdRegexPattern =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;
