"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
exports.TestFixture = function (schemas, initialState) {
    if (initialState === void 0) { initialState = {
        operations: [],
        variables: {}
    }; }
    var currentState = {
        operations: initialState.operations || [],
        testName: initialState.testName,
        variables: initialState.variables || {}
    };
    var setVariable = function (generatedType, variableName) {
        currentState.variables = utils_1.setNested(currentState.variables, variableName, generatedType);
    };
    var clear = function (operation) {
        var deleteDatabase = function (name) {
            currentState.operations.push({
                operationType: "database",
                type: "delete-table",
                name: name
            });
        };
        var clearVariables = function () {
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
        }
        else {
            clearVariables();
            deleteDatabase("All");
        }
        return exports.TestFixture(schemas, currentState);
    };
    var populate = function (operation, mutations) {
        if (mutations === void 0) { mutations = []; }
        var addToDatabase = function (generatedType, genType, database) {
            currentState.operations.push({
                operationType: "database",
                type: "add-item",
                item: generatedType,
                schema: genType,
                database: database
            });
        };
        var item;
        if (operation.schema === "Custom") {
            item = operation.item ? operation.item(currentState) : undefined;
        }
        else {
            var schema = schemas[operation.schema];
            if (schema === undefined) {
                throw new Error("Trying to populate with invalid GenType: " + operation.schema);
            }
            item = utils_1.generateType(schema, currentState, mutations);
        }
        if (item) {
            if (operation.database) {
                addToDatabase(item, operation.schema, operation.database);
            }
            if (operation.variable) {
                setVariable(item, operation.variable);
            }
        }
        else {
            throw new Error("Property item is not defined with Custom schema");
        }
        return exports.TestFixture(schemas, currentState);
    };
    var send = function (operation, mutations) {
        if (mutations === void 0) { mutations = []; }
        var endpoint = operation.endpoint;
        var parameters = operation.parameters;
        if (parameters) {
            Object.keys(parameters).map(function (parameterName) {
                var parameter = parameters[parameterName];
                if (parameter) {
                    var parameterValue = utils_1.getParameterValue(parameter, currentState);
                    endpoint = endpoint.replace("{" + parameterName + "}", parameterValue);
                }
                else {
                    throw new Error("Invalid parameter name " + parameter);
                }
            });
        }
        switch (operation.type) {
            case "GET":
                currentState.operations.push({
                    operationType: "controller",
                    type: "GET",
                    claims: operation.claims ? operation.claims(currentState) : undefined,
                    endpoint: endpoint,
                    expected: operation.expected(currentState)
                });
                break;
            case "POST":
                var schema = schemas[operation.schema];
                if (schema === undefined) {
                    throw new Error("Trying to populate with invalid GenType: " + operation.schema);
                }
                if (operation.schema === "Custom" && !operation.item) {
                    throw new Error("item is undefined with custom schema");
                }
                var generatedType = operation.item
                    ? operation.item(currentState)
                    : utils_1.generateType(schema, currentState, mutations);
                if (operation.variable !== undefined) {
                    setVariable(generatedType, operation.variable);
                }
                currentState.operations.push({
                    operationType: "controller",
                    type: "POST",
                    endpoint: endpoint,
                    postBody: generatedType,
                    claims: operation.claims ? operation.claims(currentState) : undefined,
                    expected: operation.expected(currentState)
                });
                break;
        }
        return exports.TestFixture(schemas, currentState);
    };
    var comment = function (comment) {
        currentState.operations.push({
            operationType: "comment",
            comment: comment
        });
        return exports.TestFixture(schemas, currentState);
    };
    var testingEnvironment = function (operation) {
        var environment = {};
        Object.keys(operation).map(function (key) {
            var operationValue = operation[key];
            if (operationValue) {
                var value = undefined;
                switch (operationValue.type) {
                    case "literal":
                        value = operationValue.literal;
                        break;
                    case "variable":
                        value = utils_1.getNested(currentState.variables, operationValue.variable);
                        break;
                    default:
                        throw new Error("Invalid passing type in testingEnvironment");
                }
                environment[key] = value;
                setVariable(value, ".ENVIRONMENT_" + key.toLocaleUpperCase());
            }
        });
        currentState.operations.push({
            operationType: "environment",
            environment: environment
        });
        return exports.TestFixture(schemas, currentState);
    };
    return {
        state: currentState,
        clear: clear,
        populate: populate,
        send: send,
        comment: comment,
        testingEnvironment: testingEnvironment
    };
};
//# sourceMappingURL=test-generator.js.map