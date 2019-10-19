import { FixtureState } from "../../test-generator";

export interface PopulateOperation<
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType extends {}
> {
  database?: DatabaseType;
  variable?: string;
  item?: (currentState: FixtureState<DatabaseType, ResponseType>) => {};
  schema: SchemaType | "Custom";
}
