/**
 * 会社サービスで発生したエラーを表す既定クラス
 */
class CompanyServiceError extends Error {
  public constructor() {
    super();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CompanyServiceError);
    }

    this.name = this.constructor.name;
  }
}

/**
 * 会社サービスで発生した会社が存在しないエラーを表すクラス
 */
export class CompanyServiceNotExistsError extends CompanyServiceError {
  public id: string;

  public constructor(id: string) {
    super();

    this.name = this.constructor.name;
    this.id = id;
  }
}

/**
 * 会社サービスで発生した未知のエラーを表すクラス
 */
export class CompanyServiceUnknownError extends CompanyServiceError {
  public error: unknown;

  public constructor(error: unknown) {
    super();

    this.name = this.constructor.name;
    this.error = error;
  }
}
