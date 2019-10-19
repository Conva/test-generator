import { writeFileSync } from "fs";
import { CodeOperation } from "../../operation/operation";
import { FixtureCollection } from "../../test-generator";
import { testRequestFrom } from "../request-generator";

const testBodySpaces = new Array(12 + 1).join(" ");
const testSetupSpaces = new Array(5 + 1).join(" ");

const operationToCode = <DatabaseType extends string, ResponseType extends {}>(
  operation: CodeOperation<DatabaseType, ResponseType>,
  {
    testName,
    testPath,
    assetPath
  }: { testName: string; assetPath: string; testPath?: string }
) => {
  switch (operation.operationType) {
    case "database": {
      switch (operation.type) {
        case "add-item": {
          let variableName = `temp${operation.database}`;
          let result = `\n${testBodySpaces}let ${variableName} = Compact.deserialize<${
            operation.schema
          }> ${JSON.stringify(JSON.stringify(operation.item))}`;
          result += `\n${testBodySpaces}(DatabaseService.add (Tables.${operation.database} databaseClient) ${variableName} None).Wait()`;
          return result;
        }
        case "delete-table": {
          if (operation.name === "All") {
            return `\n${testBodySpaces}clearAllTables databaseClient`;
          }
          return `\n${testBodySpaces}deleteDatabase databaseClient (${operation.name})`;
        }
        case "get-item": {
          throw new Error("GET database not implemented yet");
        }
      }
    }
    case "controller": {
      let assetFilePath = `${assetPath}/${testName}.json`;
      if (testPath) {
        writeFileSync(
          `${testPath}/${assetFilePath}`,
          JSON.stringify(testRequestFrom(operation)),
          {
            encoding: "utf8"
          }
        );
      }
      return `\n${testBodySpaces}testController "${assetFilePath}"`;
    }
    case "comment": {
      return `\n${testBodySpaces}// ${operation.comment}`;
    }

    case "environment": {
      const { time, guid } = operation.environment;
      let code = "";
      Object.keys(operation.environment).map(key => {
        if (guid && key === "guid") {
          code += `\n${testBodySpaces}changeGuidTo "${guid}"`;
        }

        if (time && key === "time") {
          code += `\n${testBodySpaces}changeTimeTo "${
            typeof time === "string" ? time : time.toISOString()
          }"`;
        }
      });
      return code;
    }
  }
};

export const operationsToCode = <
  SchemaType extends string,
  DatabaseType extends string,
  ResponseType extends {},
  EndpointType extends string
>(
  collection: FixtureCollection<
    SchemaType,
    DatabaseType,
    ResponseType,
    EndpointType
  >
) => {
  let namespace = collection.namespace || "NO_TEST_NAMESPACE_GIVEN";
  if (!/^[a-zA-Z]+$/g.test(namespace)) {
    throw new Error("namespace cannot have any characters but letters");
  }
  let code = collection.preTestCode ? collection.preTestCode(namespace) : "";

  code += `\n${testSetupSpaces}let databaseClient = createTestClient()\n`;
  collection.fixtures.map(fixture => {
    let testName = fixture.state.testName || "NO_TEST_NAME_GIVEN";
    if (!/^[a-zA-Z\-]+$/g.test(testName)) {
      throw new Error(
        "testName cannot have any characters but letters and dashes"
      );
    }
    code += `
     [<Test>]
     let \`\`${namespace}::${testName}\`\`() =
    `;

    fixture.state.operations.forEach(operation => {
      code += `${operationToCode(operation, {
        ...collection,
        testName
      })}`;
    });
  });
  if (collection.testPath && collection.controllerPath) {
    writeFileSync(
      `${collection.testPath}/${collection.controllerPath}/${namespace}.Test.fs`,
      code,
      {
        encoding: "utf8"
      }
    );
  }

  return code;
};
