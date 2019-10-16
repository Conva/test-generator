export interface DatabasePopulateOperation<DatabaseType extends string> {
  type: "database";
  databaseName: DatabaseType;
  item?: {};
}

export interface VariablePopulateOperation {
  type: "variable";
  variableName: string;
  item?: {};
}

export interface BothPopulateOperation<DatabaseType extends string> {
  type: "both";
  databaseName: DatabaseType;
  variableName: DatabaseType;
  item?: {};
}

export type PopulateOperation<
  SchemaType extends string,
  DatabaseType extends string
> = (
  | DatabasePopulateOperation<DatabaseType>
  | VariablePopulateOperation
  | BothPopulateOperation<DatabaseType>) & { schema: SchemaType };
