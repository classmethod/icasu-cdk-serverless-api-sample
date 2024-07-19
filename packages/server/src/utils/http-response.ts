const DEFAULT_HEADERS = {
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,DELETE",
  "Access-Control-Allow-Origin": "*",
};

export interface HttpResponseHeader {
  [key: string]: string;
}

export interface HttpResponse {
  statusCode: number;
  headers: HttpResponseHeader;
  body?: string;
}

/**
 * HTTP 200 OK レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 200 OK
 */
export const ok = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 200,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 201 Created レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 201 Created
 */
export const created = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 201,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 204 NoContent レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 204 NoContent
 */
export const noContent = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 204,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 400 BadRequest レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 400 BadRequest
 */
export const badRequest = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 400,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 403 Forbidden レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 403 Forbidden
 */
export const forbidden = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 403,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 404 NotFound レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 404 NotFound
 */
export const notFound = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 404,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 409 Conflict レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 409 Conflict
 */
export const conflict = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 409,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};

/**
 * HTTP 500 InternalServerError レスポンスを生成する
 * @param body 本文
 * @param headers ヘッダー
 * @return HTTP 500 InternalServerError
 */
export const internalServerError = (
  body?: string,
  headers?: HttpResponseHeader,
): HttpResponse => {
  const httpResponse: HttpResponse = {
    statusCode: 500,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };

  if (body) {
    httpResponse.body = body;
  }

  return httpResponse;
};
