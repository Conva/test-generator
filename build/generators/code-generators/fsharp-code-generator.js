"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var request_generator_1 = require("../request-generator");
var testBodySpaces = new Array(12 + 1).join(" ");
var testSetupSpaces = new Array(5 + 1).join(" ");
var operationToCode = function (operation, _a) {
    var testName = _a.testName, testPath = _a.testPath, assetPath = _a.assetPath;
    switch (operation.operationType) {
        case "database": {
            switch (operation.type) {
                case "add-item": {
                    var variableName = "temp" + operation.database;
                    var result = "\n" + testBodySpaces + "let " + variableName + " = Compact.deserialize<" + operation.schema + "> " + JSON.stringify(JSON.stringify(operation.item));
                    result += "\n" + testBodySpaces + "(DatabaseService.put (Tables." + operation.database + " databaseClient) " + variableName + " false).Wait()";
                    return result;
                }
                case "delete-table": {
                    if (operation.name === "All") {
                        return "\n" + testBodySpaces + "clearAllTables databaseClient";
                    }
                    return "\n" + testBodySpaces + "deleteDatabase databaseClient (" + operation.name + ")";
                }
                case "get-item": {
                    throw new Error("GET database not implemented yet");
                }
            }
        }
        case "controller": {
            var assetFilePath = assetPath + "/" + testName + ".json";
            if (testPath) {
                fs_1.writeFileSync(testPath + "/" + assetFilePath, JSON.stringify(request_generator_1.testRequestFrom(operation)), {
                    encoding: "utf8"
                });
            }
            return "\n" + testBodySpaces + "testController \"" + assetFilePath + "\"";
        }
        case "comment": {
            return "\n" + testBodySpaces + "// " + operation.comment;
        }
        case "environment": {
            var _b = operation.environment, time_1 = _b.time, guid_1 = _b.guid;
            var code_1 = "";
            Object.keys(operation.environment).map(function (key) {
                if (guid_1 && key === "guid") {
                    code_1 += "\n" + testBodySpaces + "changeGuidTo \"" + guid_1 + "\"";
                }
                if (time_1 && key === "time") {
                    code_1 += "\n" + testBodySpaces + "changeTimeTo \"" + (typeof time_1 === "string" ? time_1 : time_1.toISOString()) + "\"";
                }
            });
            return code_1;
        }
    }
};
exports.operationsToCode = function (collection) {
    var namespace = collection.namespace || "NO_TEST_NAMESPACE_GIVEN";
    if (!/^[a-zA-Z]+$/g.test(namespace)) {
        throw new Error("namespace cannot have any characters but letters");
    }
    var code = collection.preTestCode ? collection.preTestCode(namespace) : "";
    code += "\n" + testSetupSpaces + "let databaseClient = createTestClient()\n";
    collection.fixtures.map(function (fixture) {
        var testName = fixture.state.testName || "NO_TEST_NAME_GIVEN";
        if (!/^[a-zA-Z\-]+$/g.test(testName)) {
            throw new Error("testName cannot have any characters but letters and dashes");
        }
        code += "\n     [<Test>]\n     let ``" + namespace + "::" + testName + "``() =\n    ";
        fixture.state.operations.forEach(function (operation) {
            code += "" + operationToCode(operation, __assign(__assign({}, collection), { testName: testName }));
        });
    });
    if (collection.testPath && collection.controllerPath) {
        fs_1.writeFileSync(collection.testPath + "/" + collection.controllerPath + "/" + namespace + ".Test.fs", code, {
            encoding: "utf8"
        });
    }
    return code;
};
//# sourceMappingURL=fsharp-code-generator.js.map