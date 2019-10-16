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
export interface FixtureState<DatabaseType extends string, ResponseType extends {}, EndpointType extends string> {
    operations: Operation<DatabaseType, ResponseType, EndpointType>[];
    testName?: string;
    variables: {
        [variableName: string]: any;
    };
}
export interface FixtureCollection<SchemaType extends string, DatabaseType extends string, ResponseType extends {}, EndpointType extends string> {
    namespace?: string;
    preTestCode?: (namespace: string) => string;
    testPath: string;
    assetPath: string;
    fixtures: Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>[];
}
export interface Fixture<SchemaType extends string, DatabaseType extends string, ResponseType, EndpointType extends string> {
    state: FixtureState<DatabaseType, ResponseType, EndpointType>;
    clear: (op?: ClearOperation) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    populate: (type: SchemaType, operation: PopulateOperation<DatabaseType>, mutations?: Mutation[]) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    send: (type: SchemaType, endpoint: EndpointType, expected: (currentState: FixtureState<DatabaseType, ResponseType, EndpointType>) => {
        body: ResponseType;
        statusCode: number;
    }, options?: {
        item?: {};
        variableName?: string;
        claims?: {};
    }, mutations?: Mutation[]) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    terminate: () => FixtureState<DatabaseType, ResponseType, EndpointType>;
}
export declare const TestFixture: <SchemaType extends string, DatabaseType extends string, ResponseType_1, EndpointType extends string>(schemas: {
    [schemaName: string]: Schema;
}, initialState?: FixtureState<DatabaseType, ResponseType_1, EndpointType>) => Fixture<SchemaType, DatabaseType, ResponseType_1, EndpointType>;
