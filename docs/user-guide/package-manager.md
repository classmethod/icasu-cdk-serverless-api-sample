# パッケージマネージャー

パッケージマネージャーにより Node.js の依存関係を管理することができます。

ここではパッケージマネージャーとして npm の ICASU NOTE および導入手順を記載します。

## ICASU NOTE

- npm 社は GitHub 社により買収されたため、Dependabot をはじめとした GitHub の機能の優先的なサポートが期待できる
  - 例えば [pnpm は Dependabot alerts 非対応](https://docs.github.com/en/enterprise-cloud@latest/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates#pnpm) である
- Node.js 標準のパッケージマネージャーであるため、Node.js 最新バージョンでの優先的なサポートが期待できる
- AWS CDK 利用時の不具合報告が少ない
  - 例えば pnpm では AWS CDK の lambda-nodejs の利用において次のような事象が報告されているため、利用時には注意が必要である
    - [AWS CDK(aws-lambda-nodejs)のデプロイ時にNode.js v14非対応のpnpm v8が使われエラーになる問題を解消](https://zenn.dev/cureapp/articles/aws-lambda-nodejs-pnpm-error)
    - [(lambda-nodejs): Unable to use `nodeModules` with pnpm · Issue #21910 · aws/aws-cdk](https://github.com/aws/aws-cdk/issues/21910)
    - [lambda-nodejs: Bundling fails with recent pnpm version · Issue #25612 · aws/aws-cdk](https://github.com/aws/aws-cdk/issues/25612)

## npm 導入手順

npm 環境を初期化により `package.json` を作成します。

```shell
npm init -y
```

`.gitignore` ファイルを作成し、`node_modules` ディレクトリを無視するように設定します。

```shell
touch .gitignore
echo "node_modules" >> .gitignore
```
