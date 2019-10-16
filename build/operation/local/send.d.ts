import { FixtureState } from "../../test-generator";
export interface SendOperationOptions<DatabaseType extends string, ResponseType extends {}, EndpointType extends string> {
    claims?: {};
    expected: (currentState: FixtureState<DatabaseType, ResponseType>) => {
        body?: ResponseType;
        statusCode: number;
    };
}
export interface VariableParameterType {
    type: "variable";
    variableName: string;
}
export interface LiteralParameterType {
    type: "literal";
    literal: string;
}
export declare type ParameterType = LiteralParameterType | VariableParameterType;
export declare type GetOperation<DatabaseType extends string, ResponseType extends {}, EndpointType extends string> = {
    type: "GET";
} & SendOperationOptions<DatabaseType, ResponseType, EndpointType>;
export declare type PostOperation<SchemaType extends string, DatabaseType extends string, ResponseType extends {}, EndpointType extends string> = {
    type: "POST";
    variableName?: string;
    schema: SchemaType;
    item?: {};
} & SendOperationOptions<DatabaseType, ResponseType, EndpointType>;
export declare type SendOperation<SchemaType extends string, DatabaseType extends string, ResponseType extends {}, EndpointType extends string> = (GetOperation<DatabaseType, ResponseType, EndpointType> | PostOperation<SchemaType, DatabaseType, ResponseType, EndpointType>) & {
    endpoint: EndpointType;
    parameters?: {
        [parameterName: string]: ParameterType;
    };
};
