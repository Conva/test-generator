import { ControllerOperation } from "./code/controller";
import { DatabaseOperation } from "./code/database";
import { ClearOperation } from "./local/clear";
import { PopulateOperation } from "./local/populate";
import { SendOperation } from "./local/send";
export declare type CodeOperation<DatabaseType extends string, ResponseType extends {}> = DatabaseOperation<DatabaseType> | ControllerOperation<ResponseType>;
export declare type LocalOperation<SchemaType extends string, DatabaseType extends string, ResponseType extends {}, EndpointType extends string> = ClearOperation<DatabaseType> | PopulateOperation<SchemaType, DatabaseType> | SendOperation<SchemaType, DatabaseType, ResponseType, EndpointType>;
