// ランタイム内でインスタンスが再利用できるように別モジュール化している
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { captureAWSv3Client } from "aws-xray-sdk";

const region = process.env.AWS_REGION || "ap-northeast-1";
const apiVersion = "2012-08-10";

/**
 * DynamoDB クライアントの初期化
 */
const dynamodbClient = captureAWSv3Client(
  new DynamoDBClient({
    region: region,
    apiVersion: apiVersion,
    requestHandler: new NodeHttpHandler({
      /**
       * DynamoDB クライアントの場合のチューニング例
       * @see https://aws.amazon.com/jp/blogs/news/tuning-aws-java-sdk-http-request-settings-for-latency-aware-amazon-dynamodb-applications/
       */
      connectionTimeout: 200, // 初回の TCP 接続（SYN SENT）の試行に十分な値を設定。2回目の TCP Retransmission を待たずにタイムアウトさせる
      requestTimeout: 1000, // 1 回あたりの API オペレーションの最大取得サイズ 1 MB の取得に十分な値を設定
    }),
  }),
);

/**
 * DynamoDB クライアントをラップした DocumentClient の初期化
 */
export const dynamoDBDocument = DynamoDBDocument.from(dynamodbClient);
