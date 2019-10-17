export interface VariablePassingType {
  type: "variable";
  variable: string;
}
export interface LiteralPassingType<T> {
  type: "literal";
  literal: T;
}
export type PassingType<T> = LiteralPassingType<T> | VariablePassingType;
