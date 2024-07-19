import {
  requestToRestApi,
  RestApiResponse,
} from "@/utils/rest-api-endpoint-helper";

export const companiesOptionsTests = () => {
  let response: RestApiResponse = undefined;

  beforeAll(async () => {
    response = await requestToRestApi({
      path: "companies",
      method: "OPTIONS",
      headers: {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization",
        Origin: "https://example.com",
      },
    });
  });

  test("Preflight Request が成功すること", () => {
    expect(response?.status).toBe(204);
    expect(response?.headers).toMatchObject({
      "access-control-allow-headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
      "access-control-allow-methods": "OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD",
      "access-control-allow-origin": "*",
      "access-control-max-age": "300",
    });
  });
};
