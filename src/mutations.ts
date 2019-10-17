export interface Mutation {
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


export type MutationTo = VariableMutation | LiteralMutation;
