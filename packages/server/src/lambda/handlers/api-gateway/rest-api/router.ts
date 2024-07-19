import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import serverlessExpress from "@codegenie/serverless-express";
import middy from "@middy/core";
import cors from "cors";
import express, { Request, Response } from "express";

import { companiesGetHandler } from "./companies-get";
import { companiesIdDeleteHandler } from "./companies-id-delete";
import { companiesIdGetHandler } from "./companies-id-get";
import { companiesIdPostHandler } from "./companies-post";
import { logger } from "@/utils/logger";

/**
 * ICASU_NOTE: ルーティング先の Lambda handler の命名を `<パス>-<メソッド名>` という形式にすることで、
 *             どの handler がどのルーティングに対応しているのかが一目でわかるようになります。
 */

const app = express();
app.use(cors());
app.use(express.json());

/**
 * API パスパラメーター /companies で POST メソッドを受け付けるルーティング
 * @param req リクエスト
 * @param res レスポンス
 */
app.post("/companies", async (req: Request, res: Response): Promise<void> => {
  const response = await companiesIdPostHandler(req);

  res.header(response.headers);
  res.status(response.statusCode).send(response.body);
});

/**
 * API パスパラメーター /companies/{id} で GET メソッドを受け付けるルーティング
 * @param req リクエスト
 * @param res レスポンス
 */
app.get(
  "/companies/:id",
  async (req: Request, res: Response): Promise<void> => {
    const response = await companiesIdGetHandler(req);

    res.header(response.headers);
    res.status(response.statusCode).send(response.body);
  },
);

/**
 * API パスパラメーター /companies/{id} で DELETE メソッドを受け付けるルーティング
 * @param req リクエスト
 * @param res レスポンス
 */
app.delete(
  "/companies/:id",
  async (req: Request, res: Response): Promise<void> => {
    const response = await companiesIdDeleteHandler(req);

    res.header(response.headers);
    res.status(response.statusCode).send(response.body);
  },
);

/**
 * API パスパラメーター /companies で GET メソッドを受け付けるルーティング
 * @param req リクエスト
 * @param res レスポンス
 */
app.get("/companies", async (req: Request, res: Response): Promise<void> => {
  const response = await companiesGetHandler(req);

  res.header(response.headers);
  res.status(response.statusCode).send(response.body);
});

/**
 * logger の出力に Lambda の context を追加するためのラップ処理
 * @see https://aws.amazon.com/jp/blogs/news/simplifying-serverless-best-practices-with-aws-lambda-powertools-for-typescript/
 */
export const handler = middy(serverlessExpress({ app })).use(
  injectLambdaContext(logger),
);
