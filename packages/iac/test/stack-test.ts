import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { expect, test } from "vitest";

import { getAppParameter } from "../bin/parameter";
import { MainStack } from "../lib/main-stack";
import { ignoreAssetHashSerializer } from "./plugins/ignore-asset-hash";

export const snapshotStackTests = (envName: "dev" | "stg" | "prd") => {
  process.env[`${envName.toUpperCase()}_AWS_ACCOUNT_ID`] =
    `${envName}-dummy-aws-account-id`;

  const app = new cdk.App();

  const appParameter = getAppParameter(envName);

  const stack = new MainStack(
    app,
    `${appParameter.envName}-${appParameter.projectName}-MainStack`,
    appParameter,
  );
  const template = Template.fromStack(stack).toJSON();

  test("snapshot", (): void => {
    expect.addSnapshotSerializer(ignoreAssetHashSerializer);
    expect(template).toMatchSnapshot();
  });
};
