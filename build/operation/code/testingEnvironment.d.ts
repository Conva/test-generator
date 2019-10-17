export declare type TestingEnvironment = Partial<{
    guid: string;
    time: Date;
    [index: string]: Date | string;
}>;
export declare type TestingEnvironmentOperation = {
    operationType: "testingEnvironment";
    testingEnvironment: TestingEnvironment;
};
