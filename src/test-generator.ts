import { Mutation, MutationTo } from "./mutations";
import {
  ClearOp as ClearOperation,
  generateType,
  Operation
} from "./operation";
import { PopulateOperation } from "./populate";
import { setNested } from "./utils";

export interface Schema {
  $schema: string;
  title: string;
  type: string;
  additionalProperties: boolean;
  required: string[];
  properties: {};
}

export interface FixtureState<
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
> {
  operations: Operation<DatabaseType, ResponseType, EndpointType>[];
  testName?: string;
  variables: { [variableName: string]: any };
}

export interface FixtureCollection<
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
> {
  namespace?: string;
  preTestCode?: (namespace: string) => string;
  testPath: string;
  assetPath: string;
  fixtures: Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>[];
}

////////////////////////////////////////////////////

export interface Fixture<
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType,
  EndpointType extends string
> {
  state: FixtureState<DatabaseType, ResponseType, EndpointType>;
  clear: (
    op?: ClearOperation
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
  populate: (
    type: SchemaType,
    operation: PopulateOperation<DatabaseType>,
    mutations?: Mutation[]
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
  send: (
    type: SchemaType,
    endpoint: EndpointType,
    expected: (
      currentState: FixtureState<DatabaseType, ResponseType, EndpointType>
    ) => { body: ResponseType; statusCode: number },
    options?: { item?: {}; variableName?: string; claims?: {} },
    mutations?: Mutation[]
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
  terminate: () => FixtureState<DatabaseType, ResponseType, EndpointType>;
}

export const TestFixture = <
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType,
  EndpointType extends string
>(
  schemas: { [schemaName: string]: Schema },
  initialState: FixtureState<DatabaseType, ResponseType, EndpointType> = {
    operations: [],
    variables: {}
  }
): Fixture<SchemaType, DatabaseType, ResponseType, EndpointType> => {
  const currentState = initialState;

  const setVariable = (generatedType: {}, variableName: string) => {
    currentState.variables = setNested(
      currentState.variables,
      variableName,
      generatedType
    );
  };

  const clear = (op?: ClearOperation) => {
    const deleteDatabase = (op?: ClearOperation) => {
      currentState.operations.push({
        operationType: "database",
        type: "delete-table",
        name: op ? op.name : "All"
      });
    };
    const clearVariables = () => {
      currentState.variables = {};
    };
    if (op) {
      switch (op.type) {
        case "database":
          deleteDatabase(op);
          break;
        case "variable":
          clearVariables();
          break;
        default:
          throw new Error("Database operation not specified");
      }
    } else {
      clearVariables();
      deleteDatabase();
    }
    return TestFixture(schemas, currentState);
  };

  const populate = (
    type: SchemaType,
    operation: PopulateOperation<DatabaseType>,
    mutations: { from: string; to: MutationTo }[] = []
  ) => {
    const addToDatabase = (
      generatedType: {},
      genType: string,
      databaseName: DatabaseType
    ) => {
      currentState.operations.push({
        operationType: "database",
        type: "add-item",
        item: generatedType,
        itemType: genType,
        databaseName
      });
    };

    const schema = schemas[type];
    if (schema === undefined) {
      throw new Error(`Trying to populate with invalid GenType: ${type}`);
    }
    const generatedType =
      operation.item || generateType(schema, currentState, mutations);
    switch (operation.type) {
      case "database":
        addToDatabase(generatedType, type, operation.databaseName);
        break;
      case "variable":
        setVariable(generatedType, operation.variableName);
        break;
      case "both":
        setVariable(generatedType, operation.variableName);
        addToDatabase(generatedType, type, operation.databaseName);
        break;
    }

    return TestFixture(schemas, currentState);
  };

  const send = (
    type: SchemaType,
    endpoint: EndpointType,
    expected: (
      currentState: FixtureState<DatabaseType, ResponseType, EndpointType>
    ) => { body: ResponseType; statusCode: number },
    options: { item?: {}; variableName?: string; claims?: {} } = {},
    mutations: Mutation[] = []
  ) => {
    const schema = schemas[type];
    if (schema === undefined) {
      throw new Error(`Trying to populate with invalid GenType: ${type}`);
    }
    const generatedType = options.item
      ? options.item
      : generateType(schema, currentState, mutations);

    if (options.variableName !== undefined) {
      setVariable(generatedType, options.variableName);
    }

    currentState.operations.push({
      operationType: "send",
      endpoint,
      claims: options.claims ? options.claims : {},
      expected: expected(currentState),
      sent: generatedType
    });

    return TestFixture(schemas, currentState);
  };

  const terminate = () => {
    return currentState;
  };

  return { state: currentState, clear, populate, send, terminate };
};
