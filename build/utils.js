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
    // @ts-ignore
    return previous[lastIndex];
};
//# sourceMappingURL=utils.js.map