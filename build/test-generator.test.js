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
test("send object", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        operations: [],
        variables: { SomeVariable: { Other: "Hello" } },
        testName: "SampleTest"
    })
        .send("PhoneVerificationInput", "/endpoint/url", function (currentState) {
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
    }, { variableName: ".CodeInput" }, [])
        .terminate();
    var PhoneNumber = fixture.variables["CodeInput"]["PhoneNumber"];
    var Code = fixture.variables["CodeInput"]["Code"];
    expect(fixture).toEqual({
        testName: "SampleTest",
        operations: [
            {
                operationType: "send",
                endpoint: "/endpoint/url",
                claims: {},
                expected: {
                    body: {
                        OkResponse: { SetCodeIsAllGood: { Code: Code, Other: "Hello" } }
                    },
                    statusCode: 200
                },
                sent: { Code: Code, PhoneNumber: PhoneNumber }
            }
        ],
        variables: {
            SomeVariable: { Other: "Hello" },
            CodeInput: { Code: Code, PhoneNumber: PhoneNumber }
        }
    });
});
test("populate both with given variable", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema, {
        operations: [],
        variables: { SomeObject: { Hello: { World: "notOriginal" } } },
        testName: "SampleTest"
    })
        .populate("PhoneVerificationInput", {
        type: "both",
        databaseName: "SomeDatabaseName",
        variableName: ".SomeVariableName"
    }, [
        {
            from: ".PhoneNumber",
            to: { type: "variable", variableName: ".SomeObject.Hello.World" }
        }
    ])
        .terminate();
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
                databaseName: "SomeDatabaseName"
            }
        ],
        variables: {
            SomeObject: { Hello: { World: "notOriginal" } },
            SomeVariableName: { PhoneNumber: "notOriginal", Code: Code }
        }
    });
});
test("populate both with given object", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema)
        .populate("PhoneVerificationInput", {
        type: "both",
        databaseName: "SomeDatabaseName",
        variableName: ".SomeVariableName"
    }, [{ from: ".PhoneNumber", to: { type: "object", object: "notOriginal" } }])
        .terminate();
    // @ts-ignore
    var Code = fixture.operations[0]["item"]["Code"];
    expect(fixture).toEqual({
        operations: [
            {
                operationType: "database",
                type: "add-item",
                item: { PhoneNumber: "notOriginal", Code: Code },
                itemType: "PhoneVerificationInput",
                databaseName: "SomeDatabaseName"
            }
        ],
        variables: { SomeVariableName: { PhoneNumber: "notOriginal", Code: Code } }
    });
});
test("populate both", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema)
        .populate("PhoneVerificationInput", {
        type: "both",
        databaseName: "SomeDatabaseName",
        variableName: ".SomeVariableName"
    })
        .terminate();
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
                databaseName: "SomeDatabaseName"
            }
        ],
        variables: { SomeVariableName: { PhoneNumber: PhoneNumber, Code: Code } }
    });
});
test("clear all", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema)
        .clear()
        .terminate();
    expect(fixture).toEqual({
        variables: {},
        operations: [
            { operationType: "database", type: "delete-table", name: "All" }
        ]
    });
});
test("clear specific database", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema)
        .clear({ type: "database", name: "SomeOther" })
        .terminate();
    expect(fixture).toEqual({
        variables: {},
        operations: [
            { operationType: "database", type: "delete-table", name: "SomeOther" }
        ]
    });
});
test("clear all variables", function () {
    var fixture = test_generator_1.TestFixture(sampleSchema)
        .clear({ type: "variable", name: "All" })
        .terminate();
    expect(fixture).toEqual({
        variables: {},
        operations: []
    });
});
//# sourceMappingURL=test-generator.test.js.map