import { Mutation, MutationTo } from "./mutations";
import {
  ClearOp as ClearOperation,
  generateType,
  Operation
} from "./operation";
import { PopulateOperation } from "./populate";

export interface Schema {
  $schema: string;
  title: string;
  type: string;
  additionalProperties: boolean;
  required: string[];
  properties: {};
}

export interface FixtureState {
  operations: Operation[];
  testName?: string;
  variables: { [variableName: string]: any };
}

export interface FixtureCollection {
  namespace?: string;
  preTestCode?: (namespace: string) => string;
  testPath: string;
  assetPath: string;
  fixtures: FixtureState[];
}

////////////////////////////////////////////////////

export interface Fixture<T> {
  clear: (op?: ClearOperation) => Fixture<T>;
  populate: (
    type: T,
    operation: PopulateOperation,
    mutations?: Mutation[]
  ) => Fixture<T>;
  send: (
    type: T,
    endpoint: string,
    expected: (currentState: FixtureState) => { body: {}; statusCode: number },
    options?: { item?: {}; variableName?: string; claims?: {} },
    mutations?: Mutation[]
  ) => Fixture<T>;
  terminate: () => FixtureState;
}

export const TestFixture = <T>(
  schemas: { [schemaName: string]: Schema },
  initialState: FixtureState = {
    operations: [],
    variables: {}
  }
): Fixture<T> => {
  const currentState = initialState;

  const setVariable = (generatedType: {}, variableName: string) => {
    currentState.variables[variableName] = generatedType;
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
    type: T,
    operation: PopulateOperation,
    mutations: { from: string; to: MutationTo }[] = []
  ) => {
    if (typeof type !== "string") {
      throw new Error("typeof type has to be string");
    }

    const addToDatabase = (
      generatedType: {},
      genType: string,
      databaseName: string
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
    type: T,
    endpoint: string,
    expected: (currentState: FixtureState) => { body: {}; statusCode: number },
    options: { item?: {}; variableName?: string; claims?: {} } = {},
    mutations: Mutation[] = []
  ) => {
    if (typeof type !== "string") {
      throw new Error("typeof type has to be string");
    }
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

  return { clear, populate, send, terminate };
};
