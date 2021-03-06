export interface DatabaseClear<DatabaseName extends string> {
    type: "database";
    database: "All" | DatabaseName;
}
export interface VariableClear {
    type: "variable";
    variable: "All" | string;
}
export declare type ClearOperation<DatabaseName extends string> = DatabaseClear<DatabaseName> | VariableClear;
