export type RestApiResponse<T = any> =
  | {
      data: T;
      status: number;
      statusText: string;
      headers: Record<string, string>;
    }
  | undefined;

type ParamValueType = string | number | undefined;

const REST_API_ENDPOINT = process.env.REST_API_ENDPOINT || "";

const convertObjectValuesToString = (
  params: Record<string, ParamValueType>,
) => {
  return Object.entries(params).reduce(
    (acc: Record<string, string>, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value.toString();
        return acc;
      }
      return acc;
    },
    {},
  );
};

const convertParamsToQueryString = (
  params: Record<string, ParamValueType> | undefined,
): string => {
  if (!params) {
    return "";
  }
  return new URLSearchParams(convertObjectValuesToString(params)).toString();
};

const buildUrl = (
  path: string,
  params: { [key: string]: ParamValueType } | undefined,
) => {
  if (!params) {
    return `${REST_API_ENDPOINT}/${path}`;
  }
  const queryParams = convertParamsToQueryString(params);
  return `${REST_API_ENDPOINT}/${path}${queryParams ? "?" + queryParams : ""}`;
};

const extractJsonBody = async (response: Response) => {
  try {
    return await response.json();
  } catch (error: unknown) {
    return "";
  }
};

const extractHeaders = (response: Response) => {
  const responseHeaders = response.headers;
  const headersObj: Record<string, string> = {};
  responseHeaders.forEach((v, k) => {
    headersObj[k] = v;
  });
  return headersObj;
};

export const requestToRestApi = async (request: {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
  headers?: {
    [key: string]: string;
  };
  params?: {
    [key: string]: ParamValueType;
  };
  data?: {
    [key: string]: string;
  };
}): Promise<RestApiResponse> => {
  const { path, method, headers, params, data } = request;

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(data),
  });

  const extractedBody = await extractJsonBody(response);
  const extractedHeaders = extractHeaders(response);

  return {
    status: response.status,
    statusText: response.statusText,
    headers: extractedHeaders,
    data: extractedBody,
  };
};
