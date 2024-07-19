import { describe } from "vitest";

import { snapshotStackTests } from "./stack-test";

describe("Develop Environment", () => {
  snapshotStackTests("dev");
});

describe("Staging Environment", () => {
  snapshotStackTests("stg");
});

describe("Production Environment", () => {
  snapshotStackTests("prd");
});
