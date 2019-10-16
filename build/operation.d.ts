import { Mutation } from "./mutations";
import { FixtureState, Schema } from "./test-generator";
export declare const generateType: <DatabaseType extends string, ResponseType_1 extends {}, EndpointType extends string>(schema: Schema, currentState: FixtureState<DatabaseType, ResponseType_1, EndpointType>, mutations: Mutation[]) => {};
export declare type DatabaseKeyType = "RangeKey" | "HashKey" | "Combined";
export interface GetItemDatabaseOperation<DatabaseType extends string> {
    type: "get-item";
    databaseName: DatabaseType;
    key: {
        type: DatabaseKeyType;
        value: string[];
    };
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
export interface DatabaseClear {
    type: "database";
    name: "All" | string;
}
export interface VariableClear {
    type: "variable";
    name: "All" | string;
}
export declare type ClearOp = DatabaseClear | VariableClear;
export declare type DatabaseOperation<DatabaseType extends string> = (GetItemDatabaseOperation<DatabaseType> | AddItemDatabaseOperation<DatabaseType> | DeleteTableDatabaseOperation) & {
    operationType: "database";
};
export interface SendOperation<ResponseType extends {}, EndpointType extends string> {
    operationType: "send";
    sent: {};
    expected: {
        body: ResponseType;
        statusCode: number;
    };
    endpoint: EndpointType;
    claims: {};
}
export declare type Operation<DatabaseType extends string, ResponseType extends {}, EndpointType extends string> = DatabaseOperation<DatabaseType> | SendOperation<ResponseType, EndpointType>;
