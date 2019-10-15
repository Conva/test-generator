import { Schema } from "./test-generator";
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
