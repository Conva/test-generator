import { FixtureState } from "../../test-generator";
import { PassingType } from "../passing";
export interface SendOperationOptions<
  DatabaseType extends string,
  ResponseType extends {}
> {
  claims?: (currentState: FixtureState<DatabaseType, ResponseType>) => {};
  expected: (
    currentState: FixtureState<DatabaseType, ResponseType>
  ) => { body?: ResponseType; statusCode: number };
}

export type GetOperation<
  DatabaseType extends string,
  ResponseType extends {}
> = {
  type: "GET";
} & SendOperationOptions<DatabaseType, ResponseType>;

export type PostOperation<
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType extends {}
> = {
  type: "POST";
  variable?: string;
  schema: SchemaType;
  item?: {};
} & SendOperationOptions<DatabaseType, ResponseType>;

export type SendOperation<
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
> = (
  | GetOperation<DatabaseType, ResponseType>
  | PostOperation<SchemaType, DatabaseType, ResponseType>) & {
  endpoint: EndpointType;
  parameters?: { [parameterName: string]: PassingType<string> };
};
