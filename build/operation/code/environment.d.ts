export declare type Environment = Partial<{
    guid: string;
    time: Date | string;
    [index: string]: Date | string;
}>;
export declare type EnvironmentOperation = {
    operationType: "environment";
    environment: Environment;
};
