import { Mutation } from "./mutations";
import { ClearOperation } from "./operation/local/clear";
import { PopulateOperation } from "./operation/local/populate";
import { SendOperation } from "./operation/local/send";
import { TestingEnvironmentOperation } from "./operation/local/testingEnvironment";
import { CodeOperation } from "./operation/operation";
export interface Schema {
    $schema: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {};
}
export interface FixtureState<DatabaseType extends string, ResponseType extends {}> {
    operations: CodeOperation<DatabaseType, ResponseType>[];
    testName?: string;
    variables: {
        [variableName: string]: any;
    };
}
export interface FixtureCollection<SchemaType extends string, DatabaseType extends string, ResponseType extends {}, EndpointType extends string> {
    namespace?: string;
    preTestCode?: (namespace: string) => string;
    testPath?: string;
    controllerPath?: string;
    assetPath: string;
    fixtures: Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>[];
}
export interface Fixture<SchemaType extends string, DatabaseType extends string, ResponseType, EndpointType extends string> {
    state: FixtureState<DatabaseType, ResponseType>;
    clear: (operation?: ClearOperation<DatabaseType>) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    populate: (operation: PopulateOperation<SchemaType, DatabaseType>, mutations?: Mutation[]) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    send: (operation: SendOperation<SchemaType, DatabaseType, ResponseType, EndpointType>, mutations?: Mutation[]) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    comment: (comment: string) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
    testingEnvironment: (testingEnvironment: TestingEnvironmentOperation) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
}
export declare const TestFixture: <SchemaType extends string, DatabaseType extends string, ResponseType_1, EndpointType extends string>(schemas: {
    [schemaName: string]: Schema;
}, initialState?: FixtureState<DatabaseType, ResponseType_1>) => Fixture<SchemaType, DatabaseType, ResponseType_1, EndpointType>;
