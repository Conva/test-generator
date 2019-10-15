// @ts-ignore
import jsf from "json-schema-faker";
import { Mutation } from "./mutations";
import { FixtureState, Schema } from "./test-generator";
import { getNested, setNested } from "./utils";

export const generateType = (
  schema: Schema,
  currentState: FixtureState,
  mutations: Mutation[]
) => {
  let generatedType = jsf.generate(schema) as {};
  mutations.forEach(({ from, to }) => {
    switch (to.type) {
      case "variable":
        generatedType = setNested(
          generatedType,
          from,
          getNested(currentState.variables, to.variableName)
        );
        break;
      case "object":
        generatedType = setNested(generatedType, from, to.object);
        break;
      default:
        throw new Error("Mutation operation not specified");
    }
  });
  return generatedType;
};

export type DatabaseKeyType = "RangeKey" | "HashKey" | "Combined";

export interface GetItemDatabaseOperation {
  type: "get-item";
  databaseName: string;
  key: { type: DatabaseKeyType; value: string[] };
}

export interface AddItemDatabaseOperation {
  type: "add-item";
  databaseName: string;
  item: {};
  itemType: string;
}

export interface DeleteTableDatabaseOperation {
  type: "delete-table";
  name: "All" | string;
}
///////////////////////////////////////////////////////
export interface DatabaseClear {
  type: "database";
  name: "All" | string;
}
export interface VariableClear {
  type: "variable";
  name: "All" | string;
}
export type ClearOp = DatabaseClear | VariableClear;
///////////////////////////////////////////////////////
export type DatabaseOperation = (
  | GetItemDatabaseOperation
  | AddItemDatabaseOperation
  | DeleteTableDatabaseOperation) & { operationType: "database" };

export interface SendOperation {
  operationType: "send";
  sent: {};
  expected: { body: {}; statusCode: number };

  endpoint: string;
  claims: {};
}

export type Operation = DatabaseOperation | SendOperation;
