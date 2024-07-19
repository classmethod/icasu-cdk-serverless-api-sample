# Pull Request テンプレート

GitHub では、`.github` ディレクトリに配置した `pull_request_template.md` の内容をプルリクエスト作成時のテンプレートとすることができます。

これにより、プルリクエストに記述して欲しい情報をチーム内で統一することができます。

## 導入手順

以下のコマンドを実行して、`.github/pull_request_template.md` ファイルを作成します。ファイルの内容は必要に応じて修正してください。

```shell
mkdir -p .github
cat << EOF > .github/pull_request_template.md
## 機能概要

〇〇システムにおいて認証機能を実現する為に〇〇を実装します。

## 変更点

- [ ] 変更点 A
- [ ] 変更点 B

## 対象外

- 対象外 A
- 対象外 B

## アウトプット

(ScreenShot or JSON image)

## 手動テスト内容

- 単体テストがパスすることを確認
- E2E テストがパスすることを確認

## 影響範囲

- 新規機能開発の為影響無し

## 関連課題

- 関連課題 URL

## その他

- 特記事項を記載
EOF
```

## 参考

- [リポジトリ用のプルリクエストテンプレートの作成 - GitHub Docs](https://docs.github.com/ja/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
