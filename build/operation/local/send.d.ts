import { FixtureState } from "../../test-generator";
import { PassingType } from "../passing";
export interface SendOperationOptions<DatabaseType extends string, ResponseType extends {}> {
    claims?: (currentState: FixtureState<DatabaseType, ResponseType>) => {};
    expected: (currentState: FixtureState<DatabaseType, ResponseType>) => {
        body?: ResponseType;
        statusCode: number;
    };
}
export declare type GetOperation<DatabaseType extends string, ResponseType extends {}> = {
    type: "GET";
} & SendOperationOptions<DatabaseType, ResponseType>;
export declare type PostOperation<SchemaType extends string, DatabaseType extends string, ResponseType extends {}> = {
    type: "POST";
    variable?: string;
    schema: SchemaType | "Custom";
    item?: (currentState: FixtureState<DatabaseType, ResponseType>) => {};
} & SendOperationOptions<DatabaseType, ResponseType>;
export declare type SendOperation<SchemaType extends string, DatabaseType extends string, ResponseType extends {}, EndpointType extends string> = (GetOperation<DatabaseType, ResponseType> | PostOperation<SchemaType, DatabaseType, ResponseType>) & {
    endpoint: EndpointType;
    parameters?: {
        [parameterName: string]: PassingType<string>;
    };
};
