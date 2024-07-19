# ユーザーガイド

ここでは本サンプルを参考にサーバレスアーキテクチャでシステムを開発したい方向けのユーザーガイドを記載しています。

本サンプルで採用しているアーキテクチャを使用すると、クラスメソッド社内での採用実績があるため安定稼働が期待でき、また社内外にノウハウが多くあるためサポートを受けやすいとうメリットもあります。

## ツール類の導入

開発プロジェクトの初回構築時に導入するツール類の導入手順および ICASU NOTE をリンク先で紹介しています。

TODO: 各リンク先のドキュメントを作成する
TODO: リンク先ではなく本ページへの直接の記載を検討する

- [Pull Request テンプレート](./pull-request-template.md)
- [パッケージ管理ツール (npm)](./package-manager.md)
- モノレポ管理ツール (npm workspaces)
- IaC ツール (AWS CDK)
- CI/CD (GitHub Actions)
- テストフレームワーク (Vitest)
- リンター/フォーマッター (@classmethod/eslint-config)

## 実装サンプル

本サンプルリポジトリは上記のツール類を導入し、さらに以下の技術スタックを利用してサーバーレスアプリケーションを実装しています。実装サンプルとしてご利用ください。

| 機能種別                                | 技術スタック                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| デザインパターン                        | レイヤードアーキテクチャ + Humble Object パターン                                                      |
| データベース                            | Amazon DynamoDB                                                                                        |
| コンピューティング                      | [Serverless Express](https://github.com/CodeGenieApp/serverless-express) を使用したモノリシック Lambda |
| API                                     | Amazon API Gateway REST API                                                                            |
| 認証、ユーザーディレクトリ              | Amazon Cognito user pools                                                                              |
| アプリケーションログ監視/メトリクス監視 | Amazon CloudWatch, AWS Chatbot, Slack                                                                  |
