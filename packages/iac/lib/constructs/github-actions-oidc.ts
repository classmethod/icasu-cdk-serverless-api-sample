import { aws_iam, Stack, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

const CDK_QUALIFIER = "hnb659fds"; // 既定の CDK Bootstrap Stack 識別子

interface GitHubActionsOidcConstructProps {
  gitHubOwner: string;
  gitHubRepo: string;
}

export class GitHubActionsOidcConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: GitHubActionsOidcConstructProps,
  ) {
    super(scope, id);

    const { gitHubOwner, gitHubRepo } = props;
    const awsAccountId = Stack.of(this).account;
    const region = Stack.of(this).region;

    /**
     * AssumeRole の引受先を制限する信頼ポリシーを定めたロールを作成
     * @see https://github.blog/2021-11-23-secure-deployments-openid-connect-github-actions-generally-available/
     */
    const gitHubActionsOidcRole = new aws_iam.Role(
      this,
      "GitHubActionsOidcRole",
      {
        assumedBy: new aws_iam.FederatedPrincipal(
          `arn:aws:iam::${awsAccountId}:oidc-provider/token.actions.githubusercontent.com`,
          /**
           * GitHub Actions が OIDC トークンを使って AssumeRole する際の条件定義
           *
           * MEMO: manual-deploy.yml による手動デプロイを実施可能とするために、sub 条件で Pull Request 以外のイベントも許可している
           */
          {
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            },
            StringLike: {
              "token.actions.githubusercontent.com:sub": `repo:${gitHubOwner}/${gitHubRepo}:*`,
            },
          },
          "sts:AssumeRoleWithWebIdentity",
        ),
      },
    );
    new CfnOutput(this, "GitHubActionsOidcRoleArnOutput", {
      value: gitHubActionsOidcRole.roleArn,
    });

    /**
     * AssumeRole に必要なポリシーを作成
     */
    const cdkDeployPolicy = new aws_iam.Policy(this, "CdkDeployPolicy", {
      policyName: "CdkDeployPolicy",
      statements: [
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ["s3:getBucketLocation", "s3:List*"],
          resources: ["arn:aws:s3:::*"],
        }),
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: [
            "cloudformation:CreateStack",
            "cloudformation:CreateChangeSet",
            "cloudformation:DeleteChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:DescribeStacks",
            "cloudformation:DescribeStackEvents",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:GetTemplate",
          ],
          resources: [
            `arn:aws:cloudformation:${region}:${awsAccountId}:stack/*/*`,
          ],
        }),
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ["s3:PutObject", "s3:GetObject"],
          resources: [
            `arn:aws:s3:::cdk-${CDK_QUALIFIER}-assets-${awsAccountId}-${region}/*`,
          ],
        }),
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ["ssm:GetParameter"],
          resources: [
            `arn:aws:ssm:${region}:${awsAccountId}:parameter/cdk-bootstrap/${CDK_QUALIFIER}/version`,
          ],
        }),
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ["iam:PassRole"],
          resources: [
            `arn:aws:iam::${awsAccountId}:role/cdk-${CDK_QUALIFIER}-cfn-exec-role-${awsAccountId}-${region}`,
          ],
        }),
      ],
    });

    /**
     * AssumeRole に必要なポリシーをロールにアタッチ
     */
    gitHubActionsOidcRole.attachInlinePolicy(cdkDeployPolicy);
  }
}
