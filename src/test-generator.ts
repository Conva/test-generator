import { Mutation, MutationTo } from "./mutations";
import { ClearOperation } from "./operation/local/clear";
import { PopulateOperation } from "./operation/local/populate";
import { SendOperation } from "./operation/local/send";
import { CodeOperation } from "./operation/operation";
import { generateType, getParameterValue, setNested } from "./utils";

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
  ResponseType extends {}
> {
  operations: CodeOperation<DatabaseType, ResponseType>[];
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
  testPath?: string;
  controllerPath?: string;
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
  state: FixtureState<DatabaseType, ResponseType>;
  clear: (
    operation?: ClearOperation<DatabaseType>
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
  populate: (
    operation: PopulateOperation<SchemaType, DatabaseType>,
    mutations?: Mutation[]
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
  send: (
    operation: SendOperation<
      SchemaType,
      DatabaseType,
      ResponseType,
      EndpointType
    >,
    mutations?: Mutation[]
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
  comment: (
    comment: string
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
}

export const TestFixture = <
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType,
  EndpointType extends string
>(
  schemas: { [schemaName: string]: Schema },
  initialState: FixtureState<DatabaseType, ResponseType> = {
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

  const clear = (operation?: ClearOperation<DatabaseType>) => {
    const deleteDatabase = (name: string) => {
      currentState.operations.push({
        operationType: "database",
        type: "delete-table",
        name
      });
    };
    const clearVariables = () => {
      currentState.variables = {};
    };
    if (operation) {
      switch (operation.type) {
        case "database":
          deleteDatabase(operation.databaseName);
          break;
        case "variable":
          clearVariables();
          break;
        default:
          throw new Error("Database operation not specified");
      }
    } else {
      clearVariables();
      deleteDatabase("All");
    }
    return TestFixture(schemas, currentState);
  };

  const populate = (
    operation: PopulateOperation<SchemaType, DatabaseType>,
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

    const schema = schemas[operation.schema];
    if (schema === undefined) {
      throw new Error(
        `Trying to populate with invalid GenType: ${operation.schema}`
      );
    }
    const generatedType =
      operation.item || generateType(schema, currentState, mutations);
    switch (operation.type) {
      case "database":
        addToDatabase(generatedType, operation.schema, operation.databaseName);
        break;
      case "variable":
        setVariable(generatedType, operation.variableName);
        break;
      case "both":
        setVariable(generatedType, operation.variableName);
        addToDatabase(generatedType, operation.schema, operation.databaseName);
        break;
    }

    return TestFixture(schemas, currentState);
  };

  const send = (
    operation: SendOperation<
      SchemaType,
      DatabaseType,
      ResponseType,
      EndpointType
    >,
    mutations: Mutation[] = []
  ) => {
    let endpoint = operation.endpoint as string;
    const parameters = operation.parameters;
    if (parameters) {
      Object.keys(parameters).map(parameterName => {
        const parameter = parameters[parameterName];

        if (parameter) {
          const parameterValue = getParameterValue<DatabaseType, ResponseType>(
            parameter,
            currentState
          );
          endpoint = endpoint.replace(`{${parameterValue}}`, parameterValue);
        } else {
          throw new Error(`Invalid parameter name ${parameter}`);
        }
      });
    }

    switch (operation.type) {
      case "GET":
        currentState.operations.push({
          operationType: "controller",
          type: "GET",
          claims: operation.claims,
          endpoint,
          expected: operation.expected(currentState)
        });
        break;
      case "POST":
        const schema = schemas[operation.schema];
        if (schema === undefined) {
          throw new Error(
            `Trying to populate with invalid GenType: ${operation.schema}`
          );
        }

        const generatedType = operation.item
          ? operation.item
          : generateType(schema, currentState, mutations);

        if (operation.variableName !== undefined) {
          setVariable(generatedType, operation.variableName);
        }
        currentState.operations.push({
          operationType: "controller",
          type: "POST",
          endpoint,
          postBody: generatedType,
          claims: operation.claims,
          expected: operation.expected(currentState)
        });
        break;
    }

    return TestFixture(schemas, currentState);
  };

  const comment = (comment: string) => {
    currentState.operations.push({
      operationType: "comment",
      comment
    });
    return TestFixture(schemas, currentState);
  };

  return { state: currentState, clear, populate, send, comment };
};
