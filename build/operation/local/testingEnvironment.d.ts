import { PassingType } from "../passing";
export declare type TestingEnvironmentOperation = Partial<{
    guid: PassingType<string>;
    time: PassingType<Date>;
    [index: string]: PassingType<Date> | PassingType<string>;
}>;
