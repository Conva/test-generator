import { Mutation } from "./mutations";
import { PassingType } from "./operation/passing";
import { FixtureState, Schema } from "./test-generator";
export declare const generateType: <DatabaseType extends string, ResponseType_1 extends {}>(schema: Schema, currentState: FixtureState<DatabaseType, ResponseType_1>, mutations: Mutation[]) => {};
export declare const getParameterValue: <DatabaseType extends string, ResponseType_1 extends {}>(parameter: PassingType<string>, currentState: FixtureState<DatabaseType, ResponseType_1>) => string;
export declare const fetchSchemas: (schemaItems: Schema[]) => {
    [type: string]: Schema;
};
export declare const nestedIndex: (path: string) => {
    indices: string[];
    lastIndex: string;
    beforeIndex: string;
};
export declare const setNested: <T>(object: {
    [key: string]: T;
}, path: string, value: T) => {
    [x: string]: T;
};
export declare const removeNested: <T>(object: {
    [key: string]: T;
}, path: string) => {
    [key: string]: T;
};
export declare const getNested: <T, C>(object: Partial<T>, path: string) => C | undefined;
