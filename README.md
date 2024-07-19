# ICASU CDK Serverless API Sample

本サンプルはサーバレスアーキテクチャでシステムを開発する上で以下の用途で活用可能です。

- アプリケーション実装方法
- IaC(AWS CDK)
- CI/CD
- 監視

詳細は[ユーザーガイド](docs/user-guide/README.md)をご覧ください。

また ICASU の詳細は[こちら]をご覧ください。TODO: リンク先として ICASU の概要ページを作成予定

## システム構成図

![](docs/system-design/system-diagram.drawio.svg)

## 技術スタック

このサンプルでは以下の技術スタックを使用しています。

| 機能                                    | 技術スタック                                                                                           | 補足                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| 言語                                    | TypeScript                                                                                             |                                                                                                                 |
| ランタイム                              | Node.js                                                                                                |                                                                                                                 |
| IaC                                     | AWS CDK                                                                                                |                                                                                                                 |
| テストフレームワーク                    | [Vitest](https://vitest.dev/)                                                                          |                                                                                                                 |
| デザインパターン                        | レイヤードアーキテクチャ + Humble Object パターン                                                      |                                                                                                                 |
| データベース                            | Amazon DynamoDB                                                                                        |                                                                                                                 |
| コンピューティング                      | [Serverless Express](https://github.com/CodeGenieApp/serverless-express) を使用したモノリシック Lambda |                                                                                                                 |
| API                                     | Amazon API Gateway REST API                                                                            |                                                                                                                 |
| 認証、ユーザーディレクトリ              | Amazon Cognito user pools                                                                              |                                                                                                                 |
| パッケージマネージャー                  | [npm](https://www.npmjs.com/)                                                                          |                                                                                                                 |
| モノレポ管理ツール                      | [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)                                   |                                                                                                                 |
| リンター/フォーマッター                 | [eslint-config-classmethod](https://github.com/cm-cxlabs/eslint-config-classmethod)                    |                                                                                                                 |
| CI/CD                                   | GitHub Actions                                                                                         | [.github/workflows/cicd.yml](.github/workflows/cicd.yml) にて実装。PR のプッシュ時に CI実行、マージ時に CD 実行 |
| アプリケーションログ監視/メトリクス監視 |                                                                                                        | [こちら](packages/iac/lib/constructs/monitoring/README.md) にて詳細を記載                                       |

## システム設計書

本サンプルのシステム設計書は[こちら](docs/system-design/README.md)を参照してください。以下のドキュメントが含まれます。

- シーケンス図
- API 仕様書
- テーブル仕様書
- バケット仕様書
- パラメーター仕様書

## Getting Started

### Shared Service Sample のデプロイ

[Shared Service Sample](https://github.com/cm-cxlabs/shared-service-sample) の実装をデプロイして、次の機能を作成しておきます。

- OIDC プロバイダー
- アラート通知機能
- AWS リソース横断のメトリクス監視機能

### 推奨の VS Code 拡張のインストール

[.vscode/extensions.json](.vscode/extensions.json) に記載されている推奨の VS Code 拡張をインストールします。

```shell
npm run install:recommended-vscode-extensions
```

### 依存関係インストール

すべてのワークスペースに対して依存関係をインストールします。

```shell
npm ci
```

### 単体テスト

Lambda 関数のハンドラーで使用するモジュールの単体テストを実行します。

```shell
npm run test-unit
```

### パラメーターの指定

CDK アプリのコンテキストとして使用するパラメーターを、次のファイルに指定します。

- ファイル：[packages/iac/bin/parameter.ts](packages/iac/bin/parameter.ts)

### CDK スナップショットテスト

各環境に対するスナップショットテストを実行し、合成された CloudFormation テンプレートに差分が無いことを確認します。

```shell
npm run test-snapshot
```

実装変更により差分が発生する場合は、スナップショットを更新します。

```shell
npm run test-snapshot:update
```

### デプロイ

#### 開発者のローカル環境からデプロイ

デプロイ先の環境に対応する AWS アカウント ID を環境変数に指定します。

```shell
# 開発環境
export DEV_AWS_ACCOUNT_ID=<AWS アカウント ID>

# ステージング環境
export STG_AWS_ACCOUNT_ID=<AWS アカウント ID>

# 本番環境
export PRD_AWS_ACCOUNT_ID=<AWS アカウント ID>
```

AWS CDK アプリ（開発環境）をデプロイします。

```shell
npm run deploy:dev
```

デプロイ時に CloudFormation 変更セットの使用をスキップして、スタックデプロイを高速化する場合は、次のコマンドを使用します。

```shell
npm run deploy:dev:direct
```

- 参考：[[AWS CDK] `cdk deploy` で変更セットの使用をスキップして、スタックデプロイを高速化してみた | DevelopersIO](https://dev.classmethod.jp/articles/cdk-deploy-directly-without-using-changeset/)

#### GitHub Actions からデプロイ

GitHub Actions の [Manual Deploy to Development ワークフロー](.github/workflows/manual-deploy-to-development.yml)を使用して、任意のブランチを開発環境に手動デプロイすることも可能です。

### E2E テスト

#### API

REST API の E2E テスト（開発環境）を実施します。

```shell
npm run test-e2e-api:dev
```

### GitHub Actions Variables の指定

GitHub Actions Variables に、CI/CD ワークフロー で使用する AWS アカウントごとの OIDC 用 IAM Role Arn を指定します。

| Variable Name         | 説明                                                 | 例                                                                                             |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| DEV_AWS_OIDC_ROLE_ARN | 開発環境用 AWS アカウントの OIDC 用 Role Arn         | `arn:aws:iam::XXXXXXXXXXXX:role/dev-icasu-cdk-serverless--GitHubActionsOidcGitHubAc-Dpxxxxxxx` |
| STG_AWS_OIDC_ROLE_ARN | ステージング環境用 AWS アカウントの OIDC 用 Role Arn | `arn:aws:iam::XXXXXXXXXXXX:role/stg-icasu-cdk-serverless--GitHubActionsOidcGitHubAc-Dpxxxxxxx` |
| PRD_AWS_OIDC_ROLE_ARN | 本番環境用 AWS アカウントの OIDC 用 Role Arn         | `arn:aws:iam::XXXXXXXXXXXX:role/prd-icasu-cdk-serverless--GitHubActionsOidcGitHubAc-Dpxxxxxxx` |
| DEV_AWS_ACCOUNT_ID    | 開発環境用 AWS アカウント ID                         | `012345678901`                                                                                 |
| STG_AWS_ACCOUNT_ID    | ステージング環境用 AWS アカウント ID                 | `012345678901`                                                                                 |
| PRD_AWS_ACCOUNT_ID    | 本番環境用 AWS アカウント ID                         | `012345678901`                                                                                 |

T.B.D 組織移行後に [GitHub environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) を導入予定

## 貢献について

現在本リポジトリは、クラスメソッド内部のミラーとして機能しています。

今後 PR や Issue 受け入れを検討しており準備している段階です。フィードバックがありましたら、[tmk2154](https://x.com/tmk2154), [ryutawakatsuki](https://x.com/ryutawakatsuki)までお願いします。
