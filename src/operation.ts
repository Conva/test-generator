// @ts-ignore
import jsf from "json-schema-faker";
import { Mutation } from "./mutations";
import { FixtureState, Schema } from "./test-generator";
import { getNested, setNested } from "./utils";

export const generateType = <
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
>(
  schema: Schema,
  currentState: FixtureState<DatabaseType, ResponseType, EndpointType>,
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

export interface GetItemDatabaseOperation<DatabaseType extends string> {
  type: "get-item";
  databaseName: DatabaseType;
  key: { type: DatabaseKeyType; value: string[] };
}

export interface AddItemDatabaseOperation<DatabaseType extends string> {
  type: "add-item";
  databaseName: DatabaseType;
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
export type DatabaseOperation<DatabaseType extends string> = (
  | GetItemDatabaseOperation<DatabaseType>
  | AddItemDatabaseOperation<DatabaseType>
  | DeleteTableDatabaseOperation) & { operationType: "database" };

export interface SendOperation<
  ResponseType extends {},
  EndpointType extends string
> {
  operationType: "send";
  sent: {};
  expected: { body: ResponseType; statusCode: number };
  endpoint: EndpointType;
  claims: {};
}

export type Operation<
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
> = DatabaseOperation<DatabaseType> | SendOperation<ResponseType, EndpointType>;
