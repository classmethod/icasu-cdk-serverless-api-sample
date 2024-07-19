import { Construct } from "constructs";

/**
 * Construct の NodePath から ConstructId を取り出す
 * @param コンストラクトオブジェクト
 * @returns コンストラクト ID
 * @example "dev-icasu-cdk-serverless-api-sample-MainStack/Dynamodb/CompaniesTable" という NodePath から "CompaniesTable" を取り出す
 */
export const getConstructId = (construct: Construct): string => {
  const tableNodePath = construct.node.path;
  const parts = tableNodePath.split("/");
  return parts[parts.length - 1];
};
