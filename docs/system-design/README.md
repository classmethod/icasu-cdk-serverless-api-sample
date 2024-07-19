# システム設計書

このディレクトリでは、本プロジェクトのシステム設計書を管理します。

| ドキュメント名                              | 形式          | 補足  |
| ------------------------------------------- | ------------- | ----- |
| [システム構成図](system-diagram.drawio.svg) | draw.io       |       |
| シーケンス図                                | Mermaid       | T.B.D |
| [API 仕様書](rest-api.yml)                  | OpenAPI 3.0.3 |       |
| テーブル仕様書                              | Markdown      | T.B.D |
| バケット仕様書                              | Markdown      | T.B.D |
| パラメーター仕様書                          | Markdown      | T.B.D |

## ICASU NOTE

### システム構成図

本プロジェクトのシステム構成図は、[Draw.io](https://www.diagrams.net/) で作成しています。[VS Code プラグイン](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)を使うことにより作図をローカルで行うことができるようになります。

- [Draw.io（diagrams.net）で作成したインフラ構成図をコードで管理する、GitHubで編集差分を確認する | DevelopersIO](https://dev.classmethod.jp/articles/create-infrastructure-diagrams-in-drawio-diactamsnet-manage-them-in-code-and-github/)

ただし Draw.io に登録されている AWS アイコンはアップデートがされていないため、最新のアイコンを[公式サイト](https://aws.amazon.com/jp/architecture/icons/)からダウンロードして使用することをおすすめします。

### API 仕様書

#### OAS バージョンについて

本プロジェクトの API 仕様書は、[OpenAPI Specification (OAS) 3.0.3](https://spec.openapis.org/oas/v3.0.3) に準拠したフォーマットで記述しています。

現在の OAS の最新バージョンは [3.1.0](https://spec.openapis.org/oas/v3.1.0) ですが、Swagger ビューワーによっては 3.0.3 までしか対応していない場合があるため、状況に応じて適切なバージョンを選択してください。

#### パラメーターのフォーマット参考

パラメーターのフォーマット（ケースの統一方法など）は、以下のドキュメントが参考になります。

- [マネーフォワード クラウド経費APIドキュメント](https://expense.moneyforward.com/api/index.html)
- [Nature API](https://swagger.nature.global/)
- [Swagger Petstore](https://petstore.swagger.io/)

強く推奨されるフォーマットは無いので、パラメーター種類やデータ内容に応じて適切なフォーマットであること、およびプロジェクト内でフォーマットが統一されていることを意識して、チーム内で検討してください。

#### レスポンスデータの階層について

レスポンスデータに `nextToken` などのアイテム以外の情報を追加したい場合は、次のようにデータの階層を設ける実装としてください。

```js
{
  "companies":  []
  "nextToken": "eyJ..."
}
```

本プロジェクトでは、レスポンスデータでアイテムのみを返すように、階層を設けない実装としています。

#### 便利な VS Code 拡張

OAS ドキュメントを使用した開発時に役に立つ VS Code 拡張機能として、以下の Extension を [.vscode/extensions.json](../../.vscode/extensions.json) に追加しています。

| 名前           | 識別子                 | 機能                   | 注意点            |
| -------------- | ---------------------- | ---------------------- | ----------------- |
| YAML           | `redhat.vscode-yaml`   | バリデーション         |                   |
| Swagger Viewer | `Arjun.swagger-viewer` | リアルタイムプレビュー | OAS v3.1.0 未対応 |

- 参考：[VSCodeでOpenAPI Specificationドキュメントを編集する際に便利なプラグインたち | DevelopersIO](https://dev.classmethod.jp/articles/useful-plugins-when-editing-openapi-specification-documents-with-vscode/)
