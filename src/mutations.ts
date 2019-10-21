export interface Mutation{
  from: string;
  to: MutationTo;
}

export interface VariableMutation {
  type: "variable";
  variable: string;
}

export interface LiteralMutation {
  type: "literal";
  literal: any;
}

export interface ExpressionMutation<> {
  type: "expression";
  expression: (currentItem: { [key: string]: any }) => {};
}

export type MutationTo =
  | VariableMutation
  | LiteralMutation
  | ExpressionMutation;
