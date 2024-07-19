import { LogFormatter, Logger } from "@aws-lambda-powertools/logger";
import {
  LogAttributes,
  UnformattedAttributes,
} from "@aws-lambda-powertools/logger/lib/types";

/**
 * ログフォーマットをカスタマイズするクラス
 *
 * TODO: Serverless Express の利用に適したログフォーマットを実装する
 */
class MyLogFormatter extends LogFormatter {
  public formatAttributes(attributes: UnformattedAttributes): LogAttributes {
    return attributes;
  }

  public formatError(error: Error): LogAttributes {
    return {
      ...{
        name: error.name,
        location: this.getCodeLocation(error.stack),
        stack: error.stack,
      },
      ...error,
    };
  }
}

/**
 * ロガーのインスタンスを生成
 */
export const logger = new Logger({
  logFormatter: new MyLogFormatter(),
});
