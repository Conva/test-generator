"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
exports.TestFixture = function (schemas, initialState) {
    if (initialState === void 0) { initialState = {
        operations: [],
        variables: {}
    }; }
    var currentState = initialState;
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
                    deleteDatabase(operation.databaseName);
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
        var addToDatabase = function (generatedType, genType, databaseName) {
            currentState.operations.push({
                operationType: "database",
                type: "add-item",
                item: generatedType,
                itemType: genType,
                databaseName: databaseName
            });
        };
        var schema = schemas[operation.schema];
        if (schema === undefined) {
            throw new Error("Trying to populate with invalid GenType: " + operation.schema);
        }
        var generatedType = operation.item || utils_1.generateType(schema, currentState, mutations);
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
                    endpoint = endpoint.replace("{" + parameterValue + "}", parameterValue);
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
                    claims: operation.claims,
                    endpoint: endpoint,
                    expected: operation.expected(currentState)
                });
                break;
            case "POST":
                var schema = schemas[operation.schema];
                if (schema === undefined) {
                    throw new Error("Trying to populate with invalid GenType: " + operation.schema);
                }
                var generatedType = operation.item
                    ? operation.item
                    : utils_1.generateType(schema, currentState, mutations);
                if (operation.variableName !== undefined) {
                    setVariable(generatedType, operation.variableName);
                }
                currentState.operations.push({
                    operationType: "controller",
                    type: "POST",
                    endpoint: endpoint,
                    postBody: generatedType,
                    claims: operation.claims,
                    expected: operation.expected(currentState)
                });
        }
        currentState;
        return exports.TestFixture(schemas, currentState);
    };
    var comment = function (comment) {
        currentState.operations.push({
            operationType: "comment",
            comment: comment
        });
        return exports.TestFixture(schemas, currentState);
    };
    return { state: currentState, clear: clear, populate: populate, send: send, comment: comment };
};
//# sourceMappingURL=test-generator.js.map