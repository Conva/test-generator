export interface DatabasePopulateOperation {
  type: "database";
  databaseName: string;
  item?: {};
}

export interface VariablePopulateOperation {
  type: "variable";
  variableName: string;
  item?: {};
}

export interface BothPopulateOperation {
  type: "both";
  databaseName: string;
  variableName: string;
  item?: {};
}

export type PopulateOperation =
  | DatabasePopulateOperation
  | VariablePopulateOperation
  | BothPopulateOperation;
