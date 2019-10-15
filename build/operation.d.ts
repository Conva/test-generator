import { Mutation } from "./mutations";
import { FixtureState, Schema } from "./test-generator";
export declare const generateType: (schema: Schema, currentState: FixtureState, mutations: Mutation[]) => {};
export declare type DatabaseKeyType = "RangeKey" | "HashKey" | "Combined";
export interface GetItemDatabaseOperation {
    type: "get-item";
    databaseName: string;
    key: {
        type: DatabaseKeyType;
        value: string[];
    };
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
export interface DatabaseClear {
    type: "database";
    name: "All" | string;
}
export interface VariableClear {
    type: "variable";
    name: "All" | string;
}
export declare type ClearOp = DatabaseClear | VariableClear;
export declare type DatabaseOperation = (GetItemDatabaseOperation | AddItemDatabaseOperation | DeleteTableDatabaseOperation) & {
    operationType: "database";
};
export interface SendOperation {
    operationType: "send";
    sent: {};
    expected: {
        body: {};
        statusCode: number;
    };
    endpoint: string;
    claims: {};
}
export declare type Operation = DatabaseOperation | SendOperation;
