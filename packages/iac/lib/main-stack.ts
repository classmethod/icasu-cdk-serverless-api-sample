import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { AppParameter } from "../bin/parameter";
import { AlertNotificationConstruct } from "./constructs/alert-notification";
import { ApiConstruct } from "./constructs/api";
import { CognitoConstruct } from "./constructs/cognito";
import { DynamodbConstruct } from "./constructs/dynamodb";
import { GitHubActionsOidcConstruct } from "./constructs/github-actions-oidc";
import { WafConstruct } from "./constructs/waf";
import { webAclRulesForRestApi } from "./constructs/web-acl-rules/rest-api";
import { webAclRulesForUserPool } from "./constructs/web-acl-rules/user-pool";

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: AppParameter & StackProps) {
    super(scope, id, props);

    const {
      projectName,
      envName,
      commonResourcesProjectName,
      cognito,
      dynamodb,
      gitHub,
    } = props;
    const { companiesTableIndustryCreatedAtIndexName } = dynamodb;

    new GitHubActionsOidcConstruct(this, "GitHubActionsOidc", {
      gitHubOwner: gitHub.owner,
      gitHubRepo: gitHub.repo,
    });

    const { notificationSnsAction } = new AlertNotificationConstruct(
      this,
      "AlertNotification",
      {
        envName,
        commonResourcesProjectName,
      },
    );

    const dynamodbConstruct = new DynamodbConstruct(this, "Dynamodb", {
      envName,
      projectName,
      companiesTableIndustryCreatedAtIndexName,
      notificationSnsAction,
    });

    const wafForUserPool = new WafConstruct(this, "WafForUserPool", {
      webAclScope: "REGIONAL",
      webAclRules: webAclRulesForUserPool,
    });

    const cognitoConstruct = new CognitoConstruct(this, "Cognito", {
      projectName,
      envName,
      ...cognito,
      wafWebAcl: wafForUserPool.webAcl,
    });

    const wafForApi = new WafConstruct(this, "WafForApi", {
      webAclScope: "REGIONAL",
      webAclRules: webAclRulesForRestApi,
    });

    new ApiConstruct(this, "Api", {
      projectName,
      envName,
      notificationSnsAction,
      companiesTableIndustryCreatedAtIndexName,
      companiesTable: dynamodbConstruct.companiesTable,
      cognitoUserPool: cognitoConstruct.userPool,
      wafWebAcl: wafForApi.webAcl,
    });
  }
}
