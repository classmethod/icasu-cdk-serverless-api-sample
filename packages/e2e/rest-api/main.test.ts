import { companiesGetTests } from "@/rest-api/test-cases/companies-get";
import { companiesIdDeleteTests } from "@/rest-api/test-cases/companies-id-delete";
import { companiesIdGetTests } from "@/rest-api/test-cases/companies-id-get";
import { companiesOptionsTests } from "@/rest-api/test-cases/companies-options";
import { companiesPostTests } from "@/rest-api/test-cases/companies-post";

describe("/companies", () => {
  describe("OPTIONS", () => {
    companiesOptionsTests();
  });

  describe("POST", () => {
    companiesPostTests();
  });

  describe("GET", () => {
    companiesGetTests();
  });

  describe("/:id", () => {
    describe("GET", () => {
      companiesIdGetTests();
    });

    describe("DELETE", (): void => {
      companiesIdDeleteTests();
    });
  });
});
