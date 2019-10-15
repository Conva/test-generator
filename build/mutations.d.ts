export interface Mutation {
    from: string;
    to: MutationTo;
}
export interface VariableMutation {
    type: "variable";
    variableName: string;
}
export interface ObjectMutation {
    type: "object";
    object: any;
}
export declare type MutationTo = VariableMutation | ObjectMutation;
