import { FixtureState, TestFixture } from "./test-generator";
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

test("send object", () => {
  const fixture = TestFixture<string, string, {}, string>(sampleSchema, {
    operations: [],
    variables: { SomeVariable: { Other: "Hello" } },
    testName: "SampleTest"
  })
    .send(
      "PhoneVerificationInput",
      "/endpoint/url",
      (currentState) => {
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
      },
      { variableName: ".CodeInput" },
      []
    )
    .terminate();
  const PhoneNumber = fixture.variables["CodeInput"]["PhoneNumber"];
  const Code = fixture.variables["CodeInput"]["Code"];

  expect(fixture).toEqual({
    testName: "SampleTest",
    operations: [
      {
        operationType: "send",
        endpoint: "/endpoint/url",
        claims: {},
        expected: {
          body: {
            OkResponse: { SetCodeIsAllGood: { Code, Other: "Hello" } }
          },
          statusCode: 200
        },
        sent: { Code, PhoneNumber }
      }
    ],
    variables: {
      SomeVariable: { Other: "Hello" },
      CodeInput: { Code, PhoneNumber }
    }
  });
});

test("populate both with given variable", () => {
  const fixture = TestFixture(sampleSchema, {
    operations: [],
    variables: { SomeObject: { Hello: { World: "notOriginal" } } },
    testName: "SampleTest"
  })
    .populate(
      "PhoneVerificationInput",
      {
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
    )
    .terminate();
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
  const fixture = TestFixture(sampleSchema)
    .populate(
      "PhoneVerificationInput",
      {
        type: "both",
        databaseName: "SomeDatabaseName",
        variableName: ".SomeVariableName"
      },
      [{ from: ".PhoneNumber", to: { type: "object", object: "notOriginal" } }]
    )
    .terminate();
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
  const fixture = TestFixture(sampleSchema)
    .populate("PhoneVerificationInput", {
      type: "both",
      databaseName: "SomeDatabaseName",
      variableName: ".SomeVariableName"
    })
    .terminate();
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
  const fixture = TestFixture(sampleSchema)
    .clear()
    .terminate();
  expect(fixture).toEqual({
    variables: {},
    operations: [
      { operationType: "database", type: "delete-table", name: "All" }
    ]
  });
});

test("clear specific database", () => {
  const fixture = TestFixture(sampleSchema)
    .clear({ type: "database", name: "SomeOther" })
    .terminate();

  expect(fixture).toEqual({
    variables: {},
    operations: [
      { operationType: "database", type: "delete-table", name: "SomeOther" }
    ]
  });
});

test("clear all variables", () => {
  const fixture = TestFixture(sampleSchema)
    .clear({ type: "variable", name: "All" })
    .terminate();

  expect(fixture).toEqual({
    variables: {},
    operations: []
  });
});
