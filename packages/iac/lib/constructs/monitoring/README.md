# Monitoring Application Log and Metrics

[Shared Service Sample](https://github.com/cm-cxlabs/shared-service-sample) で構成したアラート通知機能を利用して、アプリケーションログ監視とメトリクス監視を実現するための CDK Construct です。

| 監視項目                    | 説明                                                                                                                                                                              | 実装                                                             | 使用例                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| Lambda アプリケーションログ | Lambda 関数が出力した `ERROR` および `WARN` という文字列を含むアプリケーションログに対する、CloudWatch メトリクスフィルターおよびアラームを実装します。                           | [Monitoring Lambda Application Log](./lambda-application-log.ts) | [API](./../api.ts)           |
| Lambda メトリクス           | リソース個別のメトリクスの監視実装は無し。                                                                                                                                        | -                                                                | -                            |
| DynamoDB メトリクス         | テーブルおよび GSI リソース個別のメトリクス `SystemErrors`、`ThrottledRequests`、`ConsumedReadCapacityUnits` および `ConsumedWriteCapacityUnits` を監視するアラームを実装します。 | [Monitoring DynamoDB Metrics](./dynamodb-metrics.ts)             | [DynamoDB](./../dynamodb.ts) |
| API Gateway メトリクス      | REST API リソース個別のメトリクス `5XXError` を監視するアラームを実装します。                                                                                                     | [Monitoring API Gateway Metrics](./api-gateway-metrics.ts)       | [API](./../api.ts)           |

AWS リソース横断のメトリクス監視については [Shared Service Sample](https://github.com/cm-cxlabs/shared-service-sample/tree/feature-monitoring-resource/packages/iac/lib/constructs/monitoring) で別途実装しています。
