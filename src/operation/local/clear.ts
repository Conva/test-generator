export interface DatabaseClear<DatabaseName extends string> {
  type: "database";
  databaseName: "All" | DatabaseName;
}
export interface VariableClear {
  type: "variable";
  variableName: "All" | string;
}

export type ClearOperation<DatabaseName extends string> =
  | DatabaseClear<DatabaseName>
  | VariableClear

