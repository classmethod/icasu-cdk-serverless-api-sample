/**
 * MEMO:
 *    aws-sdk-client-mock で @aws-sdk/lib-dynamodb の v3.576.0 以降をモックすると
 *    タイプエラーが発生するため、any によるアサーションを行っている。
 * TODO:
 *    Infrastructure Layer のテストは DynamoDB Local などのフェイクサービスを使用するように変更する。
 */

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

import { convertIso8601StringToUnixTimestampMillis } from "../../../utils/datetime";
import {
  putItem,
  getItem,
  deleteItem,
  paginateScanItem,
  paginateQueryItem,
  Industry,
} from "./companies-table";

const docClientMock = mockClient(DynamoDBDocumentClient as any);

beforeEach(() => {
  docClientMock.reset();
});

const dummyCompanyId1 = "e3162725-4b5b-4779-bf13-14d55d63a584";
const dummyCompanyId2 = "122db705-3791-289e-042c-740bec3add55";
const dummyTimestamp1 = convertIso8601StringToUnixTimestampMillis(
  "2024-01-01T00:00:00+09:00",
);
const dummyTimestamp2 = convertIso8601StringToUnixTimestampMillis(
  "2024-07-07T00:00:00+09:00",
);

const dummyCompanyItem1 = {
  id: dummyCompanyId1,
  createdAt: dummyTimestamp1,
  name: "dummy-name-1",
  industry: "IT" as Industry,
};
const dummyCompanyItem2 = {
  id: dummyCompanyId2,
  createdAt: dummyTimestamp2,
  name: "dummy-name-2",
  industry: "Manufacturing",
};

describe("putItem", () => {
  test("アイテムを put できること", async () => {
    docClientMock.on(PutCommand as any).resolves({});

    const result = await putItem(dummyCompanyItem1);

    const callsOfGet = docClientMock.commandCalls(PutCommand as any);

    expect(callsOfGet.length).toBe(1);
    expect(callsOfGet[0].args[0].input).toEqual({
      TableName: "dummy-companiesTableName",
      Item: dummyCompanyItem1,
      ConditionExpression: "attribute_not_exists(id)",
    });

    expect(result).toBeUndefined();
  });
});

describe("getItem", () => {
  test("アイテムを get できること", async () => {
    docClientMock.on(GetCommand as any).resolves({
      Item: dummyCompanyItem1,
    } as any);

    const result = await getItem(dummyCompanyId1);

    const callsOfGet = docClientMock.commandCalls(GetCommand as any);

    expect(callsOfGet.length).toBe(1);
    expect(callsOfGet[0].args[0].input).toEqual({
      TableName: "dummy-companiesTableName",
      Key: { id: dummyCompanyId1 },
    });

    expect(result).toEqual(dummyCompanyItem1);
  });
});

describe("deleteItem", () => {
  test("アイテムを delete できること", async () => {
    docClientMock.on(DeleteCommand as any).resolves({});

    const result = await deleteItem(dummyCompanyId1);

    const callsOfGet = docClientMock.commandCalls(DeleteCommand as any);

    expect(callsOfGet.length).toBe(1);
    expect(callsOfGet[0].args[0].input).toEqual({
      TableName: "dummy-companiesTableName",
      Key: { id: dummyCompanyId1 },
      ConditionExpression: "attribute_exists(id)",
    });

    expect(result).toBeUndefined();
  });
});

describe("paginateScanItem", () => {
  test("アイテムを scan できること", async () => {
    docClientMock.on(ScanCommand as any).resolvesOnce({
      Items: [dummyCompanyItem1, dummyCompanyItem2],
    } as any);

    const result = await paginateScanItem();

    const callsOfGet = docClientMock.commandCalls(ScanCommand as any);

    expect(callsOfGet.length).toBe(1);
    expect(callsOfGet[0].args[0].input).toEqual({
      TableName: "dummy-companiesTableName",
    });

    expect(result).toEqual([dummyCompanyItem1, dummyCompanyItem2]);
  });
});

describe("paginateQueryItem", () => {
  describe.each([
    [
      "IT",
      undefined,
      undefined,
      "#industry = :industry",
      { ":industry": "IT" },
      { "#industry": "industry" },
    ],
    [
      "IT",
      dummyTimestamp1,
      undefined,
      "#industry = :industry AND #createdAt >= :createdAfter",
      { ":industry": "IT", ":createdAfter": dummyTimestamp1 },
      { "#industry": "industry", "#createdAt": "createdAt" },
    ],
    [
      "IT",
      undefined,
      dummyTimestamp2,
      "#industry = :industry AND #createdAt <= :createdBefore",
      { ":industry": "IT", ":createdBefore": dummyTimestamp2 },
      { "#industry": "industry", "#createdAt": "createdAt" },
    ],
    [
      "IT",
      dummyTimestamp1,
      dummyTimestamp2,
      "#industry = :industry AND (#createdAt BETWEEN :createdAfter AND :createdBefore)",
      {
        ":industry": "IT",
        ":createdAfter": dummyTimestamp1,
        ":createdBefore": dummyTimestamp2,
      },
      { "#industry": "industry", "#createdAt": "createdAt" },
    ],
  ])(
    "industry: %s, createdAfter: %s, createdBefore: %s",
    async (
      industry,
      createdAfter,
      createdBefore,
      keyConditionExpression,
      expressionAttributeValues,
      expressionAttributeNames,
    ) => {
      test("アイテムを query できること", async () => {
        docClientMock.on(QueryCommand as any).resolvesOnce({
          Items: [dummyCompanyItem1, dummyCompanyItem2],
        } as any);

        const result = await paginateQueryItem(
          industry as Industry,
          createdAfter,
          createdBefore,
        );

        const callsOfGet = docClientMock.commandCalls(QueryCommand as any);

        expect(callsOfGet.length).toBe(1);
        expect(callsOfGet[0].args[0].input).toEqual({
          TableName: "dummy-companiesTableName",
          IndexName: "dummy-companiesTableIndustryCreatedAtIndexName",
          KeyConditionExpression: keyConditionExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ExpressionAttributeNames: expressionAttributeNames,
        });

        expect(result).toEqual([dummyCompanyItem1, dummyCompanyItem2]);
      });
    },
  );
});
