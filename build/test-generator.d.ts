import { Mutation } from "./mutations";
import { ClearOp as ClearOperation, Operation } from "./operation";
import { PopulateOperation } from "./populate";
export interface Schema {
    $schema: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {};
}
export interface FixtureState {
    operations: Operation[];
    testName?: string;
    variables: {
        [variableName: string]: any;
    };
}
export interface FixtureCollection {
    namespace?: string;
    preTestCode?: (namespace: string) => string;
    testPath: string;
    assetPath: string;
    fixtures: FixtureState[];
}
export interface Fixture<T> {
    clear: (op?: ClearOperation) => Fixture<T>;
    populate: (type: T, operation: PopulateOperation, mutations?: Mutation[]) => Fixture<T>;
    send: (type: T, endpoint: string, expected: (currentState: FixtureState) => {
        body: {};
        statusCode: number;
    }, options?: {
        item?: {};
        variableName?: string;
        claims?: {};
    }, mutations?: Mutation[]) => Fixture<T>;
    terminate: () => FixtureState;
}
export declare const TestFixture: <T>(schemas: {
    [schemaName: string]: Schema;
}, initialState?: FixtureState) => Fixture<T>;
