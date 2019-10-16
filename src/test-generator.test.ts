import { TestFixture } from "./test-generator";
import { fetchSchemas } from "./utils";

const sampleSchema = fetchSchemas([
  {
    $schema: "http://json-schema.org/draft-04/schema#",
    title: "PhoneVerificationInput",
    type: "object",
    additionalProperties: false,
    required: ["Code", "PhoneNumber"],
    properties: {
      Code: { type: "string", minLength: 1, pattern: "^([0-9]{6})$" },
      PhoneNumber: {
        type: "string",
        minLength: 1,
        pattern: "^\\+1([0-9]{3})([0-9]{7})$"
      }
    }
  }
]);

test("send object post", () => {
  const fixture = TestFixture<string, string, {}, string>(sampleSchema, {
    operations: [],
    variables: { SomeVariable: { Other: "Hello" } },
    testName: "SampleTest"
  }).send(
    {
      endpoint: "/endpoint/url",
      type: "POST",
      schema: "PhoneVerificationInput",
      variableName: ".CodeInput",
      expected: currentState => {
        return {
          body: {
            OkResponse: {
              SetCodeIsAllGood: {
                Code: currentState.variables["CodeInput"]["Code"],
                Other: currentState.variables["SomeVariable"]["Other"]
              }
            }
          },
          statusCode: 200
        };
      }
    },
    []
  ).state;
  const PhoneNumber = fixture.variables["CodeInput"]["PhoneNumber"];
  const Code = fixture.variables["CodeInput"]["Code"];

  expect(fixture).toEqual({
    testName: "SampleTest",
    operations: [
      {
        operationType: "controller",
        type: "POST",
        endpoint: "/endpoint/url",
        expected: {
          body: {
            OkResponse: { SetCodeIsAllGood: { Code, Other: "Hello" } }
          },
          statusCode: 200
        },
        postBody: { Code, PhoneNumber }
      }
    ],
    variables: {
      SomeVariable: { Other: "Hello" },
      CodeInput: { Code, PhoneNumber }
    }
  });
});

test("send object get", () => {
  const fixture = TestFixture<string, string, {}, string>(sampleSchema, {
    operations: [],
    variables: {
      SomeVariable: { Other: "Hello" },
      ParameterVariable: { Other: "variableParam" }
    },
    testName: "SampleTest"
  }).send(
    {
      endpoint: "/endpoint/url/{variableParam}/{literalParam}",
      type: "GET",
      parameters: {
        literalParam: { literal: "literalParam", type: "literal" },
        variableParam: {
          type: "variable",
          variableName: ".ParameterVariable.Other"
        }
      },
      expected: currentState => {
        return {
          body: {
            OkResponse: {
              SetCodeIsAllGood: {
                Other: currentState.variables["SomeVariable"]["Other"]
              }
            }
          },
          statusCode: 200
        };
      }
    },
    []
  ).state;
  expect(fixture).toEqual({
    testName: "SampleTest",
    operations: [
      {
        operationType: "controller",
        type: "GET",
        endpoint: "/endpoint/url/variableParam/literalParam",
        expected: {
          body: {
            OkResponse: { SetCodeIsAllGood: { Other: "Hello" } }
          },
          statusCode: 200
        }
      }
    ],
    variables: {
      SomeVariable: { Other: "Hello" },
      ParameterVariable: { Other: "variableParam" }
    }
  });
});

test("populate both with given variable", () => {
  const fixture = TestFixture(sampleSchema, {
    operations: [],
    variables: { SomeObject: { Hello: { World: "notOriginal" } } },
    testName: "SampleTest"
  }).populate(
    {
      schema: "PhoneVerificationInput",
      type: "both",
      databaseName: "SomeDatabaseName",
      variableName: ".SomeVariableName"
    },
    [
      {
        from: ".PhoneNumber",
        to: { type: "variable", variableName: ".SomeObject.Hello.World" }
      }
    ]
  ).state;
  // @ts-ignore
  const Code = fixture.operations[0]["item"]["Code"];
  expect(fixture).toEqual({
    testName: "SampleTest",
    operations: [
      {
        operationType: "database",
        type: "add-item",
        item: { PhoneNumber: "notOriginal", Code },
        itemType: "PhoneVerificationInput",
        databaseName: "SomeDatabaseName"
      }
    ],
    variables: {
      SomeObject: { Hello: { World: "notOriginal" } },
      SomeVariableName: { PhoneNumber: "notOriginal", Code }
    }
  });
});

test("populate both with given object", () => {
  const fixture = TestFixture(sampleSchema).populate(
    {
      schema: "PhoneVerificationInput",
      type: "both",
      databaseName: "SomeDatabaseName",
      variableName: ".SomeVariableName"
    },
    [{ from: ".PhoneNumber", to: { type: "object", object: "notOriginal" } }]
  ).state;
  // @ts-ignore
  const Code = fixture.operations[0]["item"]["Code"];
  expect(fixture).toEqual({
    operations: [
      {
        operationType: "database",
        type: "add-item",
        item: { PhoneNumber: "notOriginal", Code },
        itemType: "PhoneVerificationInput",
        databaseName: "SomeDatabaseName"
      }
    ],
    variables: { SomeVariableName: { PhoneNumber: "notOriginal", Code } }
  });
});

test("populate both", () => {
  const fixture = TestFixture(sampleSchema).populate({
    schema: "PhoneVerificationInput",
    type: "both",
    databaseName: "SomeDatabaseName",
    variableName: ".SomeVariableName"
  }).state;
  // @ts-ignore
  const PhoneNumber = fixture.operations[0]["item"]["PhoneNumber"];
  // @ts-ignore
  const Code = fixture.operations[0]["item"]["Code"];

  expect(fixture).toEqual({
    operations: [
      {
        operationType: "database",
        type: "add-item",
        item: { PhoneNumber, Code },
        itemType: "PhoneVerificationInput",
        databaseName: "SomeDatabaseName"
      }
    ],
    variables: { SomeVariableName: { PhoneNumber, Code } }
  });
});

test("clear all", () => {
  const fixture = TestFixture(sampleSchema, {
    operations: [],
    variables: { a: 1, b: 2 }
  }).clear().state;

  expect(fixture).toEqual({
    variables: {},
    operations: [
      { operationType: "database", type: "delete-table", name: "All" }
    ]
  });
});

test("clear specific database", () => {
  const fixture = TestFixture(sampleSchema, {
    operations: [],
    variables: { a: 1, b: 2 }
  }).clear({ type: "database", databaseName: "SomeOther" }).state;
  expect(fixture).toEqual({
    variables: { a: 1, b: 2 },
    operations: [
      { operationType: "database", type: "delete-table", name: "SomeOther" }
    ]
  });
});

test("clear all variables", () => {
  const fixture = TestFixture(sampleSchema, {
    operations: [],
    variables: { a: 1, b: 2 }
  }).clear({ type: "variable", variableName: "All" }).state;
  expect(fixture).toEqual({
    variables: {},
    operations: []
  });
});

test("comment", () => {
  const fixture = TestFixture(sampleSchema).comment("Hello World").state
  expect(fixture).toEqual({
    variables: {},
    operations: [{ operationType: "comment", comment: "Hello World" }]
  });
});
