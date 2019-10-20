import { Mutation, MutationTo } from "./mutations";
import { ClearOperation } from "./operation/local/clear";
import { PopulateOperation } from "./operation/local/populate";
import { SendOperation } from "./operation/local/send";
import { TestingEnvironmentOperation } from "./operation/local/testingEnvironment";
import { CodeOperation } from "./operation/operation";
import { generateType, getNested, getParameterValue, setNested } from "./utils";

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
    operation: PopulateOperation<SchemaType, DatabaseType, ResponseType>,
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

  testingEnvironment: (
    testingEnvironment: TestingEnvironmentOperation
  ) => Fixture<SchemaType, DatabaseType, ResponseType, EndpointType>;
}

export const TestFixture = <
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType,
  EndpointType extends string
>(
  schemas: { [schemaName: string]: Schema },
  initialState: Partial<FixtureState<DatabaseType, ResponseType>> = {
    operations: [],
    variables: {}
  }
): Fixture<SchemaType, DatabaseType, ResponseType, EndpointType> => {
  const currentState: FixtureState<DatabaseType, ResponseType> = {
    operations: initialState.operations || [],
    testName: initialState.testName,
    variables: initialState.variables || {}
  };

  const setVariable = (generatedType: any, variableName: string) => {
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
          deleteDatabase(operation.database);
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
    operation: PopulateOperation<SchemaType, DatabaseType, ResponseType>,
    mutations: { from: string; to: MutationTo }[] = []
  ) => {
    const addToDatabase = (
      generatedType: {},
      genType: string,
      database: DatabaseType
    ) => {
      currentState.operations.push({
        operationType: "database",
        type: "add-item",
        item: generatedType,
        schema: genType,
        database
      });
    };

    let item: {} | undefined;

    if (operation.schema === "Custom") {
      if (operation.item === undefined) {
        throw new Error(
          `"item" is undefined. Must be defined for Custom schema: ${operation.schema}`
        );
      }
      item = operation.item(currentState);
    } else {
      const schema = schemas[operation.schema];
      if (schema === undefined) {
        throw new Error(
          `Trying to populate with invalid GenType: ${operation.schema}`
        );
      }
      item = generateType(schema, currentState, mutations);
    }

    if (operation.database) {
      addToDatabase(item, operation.schema, operation.database);
    }

    if (operation.variable) {
      setVariable(item, operation.variable);
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
          endpoint = endpoint.replace(`{${parameterName}}`, parameterValue);
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
          claims: operation.claims ? operation.claims(currentState) : undefined,
          endpoint,
          expected: operation.expected(currentState)
        });
        break;
      case "POST":
        let item: {} | undefined;

        if (operation.schema === "Custom") {
          if (operation.item === undefined) {
            throw new Error(
              `"item" is undefined. Must be defined for Custom schema: ${operation.schema}`
            );
          }
          item = operation.item(currentState);
        } else {
          const schema = schemas[operation.schema];
          if (schema === undefined) {
            throw new Error(
              `Trying to populate with invalid GenType: ${operation.schema}`
            );
          }
          item = generateType(schema, currentState, mutations);
        }

        if (operation.variable !== undefined) {
          setVariable(item, operation.variable);
        }
        currentState.operations.push({
          operationType: "controller",
          type: "POST",
          endpoint,
          postBody: item,
          claims: operation.claims ? operation.claims(currentState) : undefined,
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

  const testingEnvironment = (operation: TestingEnvironmentOperation) => {
    const environment: { [key: string]: Date | string } = {};

    Object.keys(operation).map(key => {
      const operationValue = operation[key];
      if (operationValue) {
        let value: any | undefined = undefined;

        switch (operationValue.type) {
          case "literal":
            value = operationValue.literal;
            break;
          case "variable":
            value = getNested(currentState.variables, operationValue.variable);
            break;
          default:
            throw new Error("Invalid passing type in testingEnvironment");
        }
        environment[key] = value;
        setVariable(value, `.ENVIRONMENT_${key.toLocaleUpperCase()}`);
      }
    });

    currentState.operations.push({
      operationType: "environment",
      environment: environment
    });

    return TestFixture(schemas, currentState);
  };

  return {
    state: currentState,
    clear,
    populate,
    send,
    comment,
    testingEnvironment
  };
};
