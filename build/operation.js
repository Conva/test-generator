"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var json_schema_faker_1 = __importDefault(require("json-schema-faker"));
var utils_1 = require("./utils");
exports.generateType = function (schema, currentState, mutations) {
    var generatedType = json_schema_faker_1.default.generate(schema);
    mutations.forEach(function (_a) {
        var from = _a.from, to = _a.to;
        switch (to.type) {
            case "variable":
                generatedType = utils_1.setNested(generatedType, from, utils_1.getNested(currentState.variables, to.variableName));
                break;
            case "object":
                generatedType = utils_1.setNested(generatedType, from, to.object);
                break;
            default:
                throw new Error("Mutation operation not specified");
        }
    });
    return generatedType;
};
//# sourceMappingURL=operation.js.map