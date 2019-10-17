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
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.testRequestFrom = function (_a) {
    var endpoint = _a.endpoint, expected = _a.expected, claims = _a.claims, type = _a.type, 
    // @ts-ignore
    postBody = _a.postBody;
    return __assign(__assign({}, exports.requestFrom({
        claims: claims,
        path: endpoint,
        method: type,
        body: postBody
    })), { response: {
            statusCode: expected.statusCode,
            headers: {},
            multiValueHeaders: {
                "Content-Type": ["application/json"]
            },
            body: JSON.stringify(expected.body || {}),
            isBase64Encoded: false
        } });
};
exports.TokenSettings = {};
exports.getJWTToken = function (claims, signingKey, options) {
    if (signingKey || exports.TokenSettings.SIGNING_SECRET) {
        return jsonwebtoken_1.default.sign(claims, 
        // @ts-ignore
        signingKey || exports.TokenSettings.SIGNING_SECRET, options);
    }
    throw new Error("Signing token not given");
};
/**
 * Create payload for AWS lamda mock server request
 * @param options Options for AWS lamda payload
 */
exports.requestFrom = function (_a) {
    var _b = _a.additionalHeaders, additionalHeaders = _b === void 0 ? {} : _b, claims = _a.claims, body = _a.body, _c = _a.path, path = _c === void 0 ? "" : _c, _d = _a.resource, resource = _d === void 0 ? "/{proxy+}" : _d, _e = _a.method, method = _e === void 0 ? "POST" : _e, _f = _a.accountId, accountId = _f === void 0 ? "123456789012" : _f, _g = _a.stage, stage = _g === void 0 ? "prod" : _g;
    var headers = __assign(__assign({}, additionalHeaders), { authorization: claims ? "Bearer " + exports.getJWTToken(claims) : undefined, "content-type": "application/json", "user-agent": "PostmanRuntime/7.15.2", accept: "*/*", "cache-control": "no-cache", "postman-token": "52551a61-50dd-4b20-9dab-26fbb82cfee6", host: "localhost:5000", "accept-encoding": "gzip, deflate", "content-length": "38008", connection: "keep-alive" });
    return {
        request: {
            body: body,
            headers: headers
        },
        proxy: {
            body: body ? JSON.stringify(body) : null,
            resource: resource,
            path: path,
            httpMethod: method,
            isBase64Encoded: "false",
            queryStringParameters: {
                foo: "bar"
            },
            pathParameters: {
                proxy: path
            },
            stageVariables: {
                baz: "qux"
            },
            headers: __assign(__assign({}, headers), {
                "CloudFront-Forwarded-Proto": "https",
                "CloudFront-Is-Desktop-Viewer": "true",
                "CloudFront-Is-Mobile-Viewer": "false",
                "CloudFront-Is-SmartTV-Viewer": "false",
                "CloudFront-Is-Tablet-Viewer": "false",
                "CloudFront-Viewer-Country": "US",
                "Upgrade-Insecure-Requests": "1",
                Via: "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
                "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
                "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
                "X-Forwarded-Port": "443",
                "X-Forwarded-Proto": "https"
            }),
            requestContext: {
                accountId: accountId,
                resourceId: "123456",
                stage: stage,
                requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
                requestTime: "09/Apr/2015:12:34:56 +0000",
                requestTimeEpoch: 1428582896000,
                authorizer: {
                    claims: claims
                },
                identity: {
                    cognitoIdentityPoolId: null,
                    accountId: null,
                    cognitoIdentityId: null,
                    caller: null,
                    accessKey: null,
                    sourceIp: "127.0.0.1",
                    cognitoAuthenticationType: null,
                    cognitoAuthenticationProvider: null,
                    userArn: null,
                    userAgent: "Custom User Agent String",
                    user: null
                },
                path: "/" + stage + "/" + path,
                resourcePath: resource,
                httpMethod: method,
                apiId: "1234567890",
                protocol: "HTTP/1.1"
            }
        }
    };
};
//# sourceMappingURL=request-generator.js.map