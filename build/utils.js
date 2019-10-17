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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var json_schema_faker_1 = __importDefault(require("json-schema-faker"));
exports.generateType = function (schema, currentState, mutations) {
    var generatedType = json_schema_faker_1.default.generate(schema);
    mutations.forEach(function (_a) {
        var from = _a.from, to = _a.to;
        switch (to.type) {
            case "variable":
                generatedType = exports.setNested(generatedType, from, exports.getNested(currentState.variables, to.variable));
                break;
            case "literal":
                generatedType = exports.setNested(generatedType, from, to.literal);
                break;
            default:
                throw new Error("Mutation operation not specified");
        }
    });
    return generatedType;
};
exports.getParameterValue = function (parameter, currentState) {
    switch (parameter.type) {
        case "literal":
            return parameter.literal;
        case "variable":
            var nestedString = exports.getNested(currentState.variables, parameter.variable);
            if (typeof nestedString !== "string") {
                throw new Error("Variable is not a string");
            }
            return nestedString;
    }
};
exports.fetchSchemas = function (schemaItems) {
    var schema = {};
    schemaItems.map(function (schemaItem) {
        schema[schemaItem.title] = schemaItem;
    });
    return schema;
};
exports.nestedIndex = function (path) {
    var indices = path.split(".").slice(1);
    var beforeIndex = indices[indices.length - 2];
    var lastIndex = indices[indices.length - 1];
    return { indices: indices, lastIndex: lastIndex, beforeIndex: beforeIndex };
};
var nested = function (object, path) {
    var root = __assign({}, object);
    var _a = exports.nestedIndex(path), indices = _a.indices, lastIndex = _a.lastIndex, beforeIndex = _a.beforeIndex;
    //    @todo Make this more type safe
    return {
        root: root,
        previous: indices.slice(0, -1).reduce(
        // eslint-disable-next-line no-return-assign
        function (acc, current) {
            return acc[current] !== undefined
                ? acc[current]
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (acc[current] = {});
        }, root),
        lastIndex: lastIndex,
        beforeIndex: beforeIndex
    };
};
exports.setNested = function (object, path, value) {
    var _a = nested(object, path), root = _a.root, previous = _a.previous, lastIndex = _a.lastIndex;
    previous[lastIndex] = value;
    return root;
};
exports.removeNested = function (object, path) {
    var _a = nested(object, path), root = _a.root, previous = _a.previous, lastIndex = _a.lastIndex, beforeIndex = _a.beforeIndex;
    delete previous[lastIndex];
    if (Object.keys(previous).length === 0) {
        if (beforeIndex) {
            return exports.removeNested(root, "." + beforeIndex);
        }
    }
    return root;
};
exports.getNested = function (object, path) {
    var _a = nested(object, path), previous = _a.previous, lastIndex = _a.lastIndex;
    var result = previous[lastIndex];
    if (result !== undefined) {
        // @ts-ignore
        return result;
    }
    throw new Error("Property " + path + " not found int " + JSON.stringify(object));
};
//# sourceMappingURL=utils.js.map