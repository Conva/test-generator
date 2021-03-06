export declare type DatabaseKeyType = "RangeKey" | "HashKey" | "Combined";
export interface GetItemDatabaseOperation<DatabaseType extends string> {
    type: "get-item";
    database: DatabaseType;
    key: {
        type: DatabaseKeyType;
        value: string[];
    };
}
export interface AddItemDatabaseOperation<DatabaseType extends string> {
    type: "add-item";
    database: DatabaseType;
    item: {};
    schema: string;
}
export interface DeleteTableDatabaseOperation {
    type: "delete-table";
    name: "All" | string;
}
export declare type DatabaseOperation<DatabaseType extends string> = (GetItemDatabaseOperation<DatabaseType> | AddItemDatabaseOperation<DatabaseType> | DeleteTableDatabaseOperation) & {
    operationType: "database";
};
