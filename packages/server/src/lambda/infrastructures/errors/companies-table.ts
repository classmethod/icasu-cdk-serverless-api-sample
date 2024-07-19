import { CompanyItem } from "@/lambda/infrastructures/dynamodb/companies-table";

/**
 * 会社テーブルで発生したエラーを表す基底クラス
 */
class CompaniesTableError extends Error {
  public tableName: string;

  public constructor(tableName: string) {
    super();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CompaniesTableError);
    }

    this.name = this.constructor.name;
    this.tableName = tableName;
  }
}

/**
 * 会社アイテムがテーブル上に既に存在するエラーを表すクラス
 */
export class CompaniesTableAlreadyExistsError extends CompaniesTableError {
  public company: CompanyItem;

  public constructor(tableName: string, company: CompanyItem) {
    super(tableName);

    this.name = this.constructor.name;
    this.company = company;
  }
}

/**
 * 会社アイテムがテーブル上に存在しないエラーを表すクラス
 */
export class CompaniesTableNotExistsError extends CompaniesTableError {
  public id: string;

  public constructor(tableName: string, id: string) {
    super(tableName);

    this.name = this.constructor.name;
    this.id = id;
  }
}

/**
 * 会社テーブルで発生した未知のエラーを表すクラス
 */
export class CompaniesTableUnknownError extends CompaniesTableError {
  public error: unknown;

  public constructor(tableName: string, error: unknown) {
    super(tableName);

    this.name = this.constructor.name;
    this.error = error;
  }
}
