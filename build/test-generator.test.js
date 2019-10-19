"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test_generator_1 = require("./test-generator");
var utils_1 = require("./utils");
var sampleSchema = utils_1.fetchSchemas([
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
test("send object post", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        variables: { SomeVariable: { Other: "Hello" } },
        testName: "SampleTest"
    }).send({
        endpoint: "/endpoint/url",
        type: "POST",
        schema: "PhoneVerificationInput",
        variable: ".CodeInput",
        expected: function (currentState) {
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
    }, [
        {
            from: ".PhoneNumber",
            to: { variable: ".SomeVariable.Other", type: "variable" }
        }
    ]).state;
    var Code = fixture.variables["CodeInput"]["Code"];
    var PhoneNumber = fixture.variables["CodeInput"]["PhoneNumber"];
    expect(fixture).toEqual({
        testName: "SampleTest",
        operations: [
            {
                operationType: "controller",
                type: "POST",
                endpoint: "/endpoint/url",
                expected: {
                    body: {
                        OkResponse: { SetCodeIsAllGood: { Code: Code, Other: "Hello" } }
                    },
                    statusCode: 200
                },
                postBody: { Code: Code, PhoneNumber: "Hello" }
            }
        ],
        variables: {
            SomeVariable: { Other: "Hello" },
            CodeInput: { Code: Code, PhoneNumber: PhoneNumber }
        }
    });
});
test("send object get", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        operations: [],
        variables: {
            SomeVariable: { Other: "Hello" },
            ParameterVariable: { Other: "variableParam" }
        },
        testName: "SampleTest"
    }).send({
        endpoint: "/endpoint/url/{variableParam}/{literalParam}",
        type: "GET",
        parameters: {
            literalParam: { literal: "literalParam", type: "literal" },
            variableParam: {
                type: "variable",
                variable: ".ParameterVariable.Other"
            }
        },
        expected: function (currentState) {
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
    }, []).state;
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
test("populate both with given item", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        testName: "SampleTest"
    }).populate({
        schema: "Custom",
        item: { helloWorld: 1 },
        database: "SomeDatabaseName",
        variable: ".SomeVariableName"
    }).state;
    // @ts-ignore
    expect(fixture).toEqual({
        testName: "SampleTest",
        operations: [
            {
                operationType: "database",
                type: "add-item",
                item: { helloWorld: 1 },
                itemType: "Custom",
                database: "SomeDatabaseName"
            }
        ],
        variables: {
            SomeVariableName: { helloWorld: 1 }
        }
    });
});
test("populate both with given variable", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        operations: [],
        variables: { SomeObject: { Hello: { World: "notOriginal" } } },
        testName: "SampleTest"
    }).populate({
        schema: "PhoneVerificationInput",
        database: "SomeDatabaseName",
        variable: ".SomeVariableName"
    }, [
        {
            from: ".PhoneNumber",
            to: { type: "variable", variable: ".SomeObject.Hello.World" }
        }
    ]).state;
    // @ts-ignore
    var Code = fixture.operations[0]["item"]["Code"];
    expect(fixture).toEqual({
        testName: "SampleTest",
        operations: [
            {
                operationType: "database",
                type: "add-item",
                item: { PhoneNumber: "notOriginal", Code: Code },
                itemType: "PhoneVerificationInput",
                database: "SomeDatabaseName"
            }
        ],
        variables: {
            SomeObject: { Hello: { World: "notOriginal" } },
            SomeVariableName: { PhoneNumber: "notOriginal", Code: Code }
        }
    });
});
test("populate both with given object", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema).populate({
        schema: "PhoneVerificationInput",
        database: "SomeDatabaseName",
        variable: ".SomeVariableName"
    }, [{ from: ".PhoneNumber", to: { type: "literal", literal: "notOriginal" } }]).state;
    // @ts-ignore
    var Code = fixture.operations[0]["item"]["Code"];
    expect(fixture).toEqual({
        operations: [
            {
                operationType: "database",
                type: "add-item",
                item: { PhoneNumber: "notOriginal", Code: Code },
                itemType: "PhoneVerificationInput",
                database: "SomeDatabaseName"
            }
        ],
        variables: { SomeVariableName: { PhoneNumber: "notOriginal", Code: Code } }
    });
});
test("populate both", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema).populate({
        schema: "PhoneVerificationInput",
        database: "SomeDatabaseName",
        variable: ".SomeVariableName"
    }).state;
    // @ts-ignore
    var PhoneNumber = fixture.operations[0]["item"]["PhoneNumber"];
    // @ts-ignore
    var Code = fixture.operations[0]["item"]["Code"];
    expect(fixture).toEqual({
        operations: [
            {
                operationType: "database",
                type: "add-item",
                item: { PhoneNumber: PhoneNumber, Code: Code },
                itemType: "PhoneVerificationInput",
                database: "SomeDatabaseName"
            }
        ],
        variables: { SomeVariableName: { PhoneNumber: PhoneNumber, Code: Code } }
    });
});
test("clear all", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
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
test("clear specific database", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        operations: [],
        variables: { a: 1, b: 2 }
    }).clear({ type: "database", database: "SomeOther" }).state;
    expect(fixture).toEqual({
        variables: { a: 1, b: 2 },
        operations: [
            { operationType: "database", type: "delete-table", name: "SomeOther" }
        ]
    });
});
test("clear all variables", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        variables: { a: 1, b: 2 }
    }).clear({ type: "variable", variable: "All" }).state;
    expect(fixture).toEqual({
        variables: {},
        operations: []
    });
});
test("comment", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema).comment("Hello World").state;
    expect(fixture).toEqual({
        variables: {},
        operations: [{ operationType: "comment", comment: "Hello World" }]
    });
});
test("testingEnvironment", function () {
    var guid = "hello-world-im-a-guid";
    var time = new Date();
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        variables: { time: time }
    }).testingEnvironment({
        guid: { type: "literal", literal: guid },
        time: { type: "variable", variable: ".time" }
    }).state;
    expect(fixture).toEqual({
        variables: { time: time, ENVIRONMENT_TIME: time, ENVIRONMENT_GUID: guid },
        operations: [
            {
                operationType: "environment",
                environment: { time: time, guid: guid }
            }
        ]
    });
});
//# sourceMappingURL=test-generator.test.js.map