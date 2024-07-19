# サーバーサイドアプリケーション

Lambda 関数により実装するサーバーサイドアプリケーションのデザインパターンは「レイヤードアーキテクチャ + Humble Object パターン」を採用しています。1つの Lambda の実装内で処理の役割に応じてモジュールを階層化することにより、テスタブルなコードを実現しています。詳しくは[参考](#参考)も参照してください。

本サンプルでは [./src/lambda](./src/lambda) 配下で次のようなレイヤー階層を定義しています。

| レイヤー               | パス                              | 役割                                                                                                     | 依存                         |
| ---------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| プレゼンテーション層   | `./src/lambda/handlers/<client>/` | クライアントからのリクエストの受け付け<br>リクエストのバリデーション<br>クライアントへのレスポンスの返却 | ユースケース層<br>ドメイン層 |
| ユースケース層         | `./src/lambda/domain/usecases/`   | 複数のドメイン層の処理の組み合わせたワークフローを実装してユースケースを実現                             | ドメイン層                   |
| ドメイン層             | `./src/lambda/domain/services/`   | 独立した特定の業務ロジックを実装                                                                         | インフラストラクチャ層       |
| インフラストラクチャ層 | `./src/lambda/infrastructures/`   | AWS サービスなどアプリケーション外のシステムにアクセスする処理を実装                                     | AWS SDK または各種ライブラリ |

## 参考

Humble Object パターンの参考記事はこちら。

- [【登壇資料】ServerlessDays Fukuoka 2019 で TypeScriprt と Jest を使ったサーバーレステストの話をしました #serverlessdays #serverlessfukuoka | DevelopersIO](https://dev.classmethod.jp/articles/serverless-testing-using-typescript-and-jest/)
- [TypeScriptとJestではじめる AWS製サーバーレス REST API のユニットテスト・E2Eテスト #serverlessfukuoka #serverlessdays / Serverless testing using TypeScript and Jest - Speaker Deck](https://speakerdeck.com/wadayusuke/serverless-testing-using-typescript-and-jest?slide=25)
- [Humble Objectパターンでテスタブルに | shtnkgm](https://shtnkgm.com/blog/2020-05-17-humble-object-pattern.html)
