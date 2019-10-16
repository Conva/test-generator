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
export declare type DatabaseOperation<DatabaseType extends string> = (GetItemDatabaseOperation<DatabaseType> | AddItemDatabaseOperation<DatabaseType> | DeleteTableDatabaseOperation) & {
    operationType: "database";
};
