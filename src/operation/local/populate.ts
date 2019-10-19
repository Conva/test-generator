export interface PopulateOperation<
  SchemaType extends string,
  DatabaseType extends string
> {
  database?: DatabaseType;
  variable?: string;
  item?: {};
  schema: SchemaType | "Custom";
}
