"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operation_1 = require("./operation");
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
    var clear = function (op) {
        var deleteDatabase = function (op) {
            currentState.operations.push({
                operationType: "database",
                type: "delete-table",
                name: op ? op.name : "All"
            });
        };
        var clearVariables = function () {
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
        }
        else {
            clearVariables();
            deleteDatabase();
        }
        return exports.TestFixture(schemas, currentState);
    };
    var populate = function (type, operation, mutations) {
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
        var schema = schemas[type];
        if (schema === undefined) {
            throw new Error("Trying to populate with invalid GenType: " + type);
        }
        var generatedType = operation.item || operation_1.generateType(schema, currentState, mutations);
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
        return exports.TestFixture(schemas, currentState);
    };
    var send = function (type, endpoint, expected, options, mutations) {
        if (options === void 0) { options = {}; }
        if (mutations === void 0) { mutations = []; }
        var schema = schemas[type];
        if (schema === undefined) {
            throw new Error("Trying to populate with invalid GenType: " + type);
        }
        var generatedType = options.item
            ? options.item
            : operation_1.generateType(schema, currentState, mutations);
        if (options.variableName !== undefined) {
            setVariable(generatedType, options.variableName);
        }
        currentState.operations.push({
            operationType: "send",
            endpoint: endpoint,
            claims: options.claims ? options.claims : {},
            expected: expected(currentState),
            sent: generatedType
        });
        return exports.TestFixture(schemas, currentState);
    };
    var terminate = function () {
        return currentState;
    };
    return { state: currentState, clear: clear, populate: populate, send: send, terminate: terminate };
};
//# sourceMappingURL=test-generator.js.map