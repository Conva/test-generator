import { CommentOperation } from "./code/comment";
import { ControllerOperation } from "./code/controller";
import { DatabaseOperation } from "./code/database";
import { EnvironmentOperation } from "./code/environment";
import { ClearOperation } from "./local/clear";
import { PopulateOperation } from "./local/populate";
import { SendOperation } from "./local/send";
import { TestingEnvironmentOperation } from "./local/testingEnvironment";

export type CodeOperation<
  DatabaseType extends string,
  ResponseType extends {}
> =
  | DatabaseOperation<DatabaseType>
  | ControllerOperation<ResponseType>
  | CommentOperation
  | EnvironmentOperation;

export type LocalOperation<
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
> =
  | ClearOperation<DatabaseType>
  | PopulateOperation<SchemaType, DatabaseType>
  | SendOperation<SchemaType, DatabaseType, ResponseType, EndpointType>
  | TestingEnvironmentOperation;
