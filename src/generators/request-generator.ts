import { IncomingHttpHeaders } from "http";
import jwt from "jsonwebtoken";
import { ControllerOperation } from "../operation/code/controller";

export interface UserSpecifiedProxyOptions {
  resource?: string;
  accountId?: string;
  stage?: string;
}

export type ProxyOptions = {
  body?: any;
  path?: string;
  method?: string;
  additionalHeaders?: IncomingHttpHeaders;
  claims?: {};
} & UserSpecifiedProxyOptions;

let currentEndpoint: string | undefined; // for debug reasons only

export const testRequestFrom = <ResponseType extends {}>({
  endpoint,
  expected,
  claims,
  type,
  // @ts-ignore
  postBody
}: ControllerOperation<ResponseType>) => {
  currentEndpoint = endpoint;
  return {
    ...requestFrom({
      claims,
      path: endpoint,
      method: type,
      body: postBody
    }),
    response: {
      statusCode: expected.statusCode,
      headers: {},
      multiValueHeaders: {
        "Content-Type": ["application/json"]
      },
      body: JSON.stringify(expected.body || {}),
      isBase64Encoded: false
    }
  };
};

export let TokenSettings: { SIGNING_SECRET?: jwt.Secret } = {};

export const getJWTToken = (
  claims: {},
  signingKey?: jwt.Secret,
  options?: jwt.SignOptions
) => {
  try {
    if (signingKey || TokenSettings.SIGNING_SECRET) {
      return jwt.sign(
        claims,
        // @ts-ignore
        signingKey || TokenSettings.SIGNING_SECRET,
        { ...options, noTimestamp: true }
      );
    }
  } catch (e) {
    throw new Error(
      `JWT token failed to create: claims ${JSON.stringify(
        claims
      )}, signingKey : ${signingKey ||
        TokenSettings.SIGNING_SECRET}, options : ${JSON.stringify(
        options
      )}, currentEndpoint : ${currentEndpoint}`
    );
  }
};

/**
 * Create payload for AWS lamda mock server request
 * @param options Options for AWS lamda payload
 */
export const requestFrom = ({
  additionalHeaders = {},
  claims,
  body,
  path = "",
  resource = "/{proxy+}",
  method = "POST",
  accountId = "123456789012",
  stage = "prod"
}: ProxyOptions) => {
  const headers = {
    ...additionalHeaders,
    authorization: claims ? `Bearer ${getJWTToken(claims)}` : undefined,
    "content-type": "application/json",
    "user-agent": "PostmanRuntime/7.15.2",
    accept: "*/*",
    "cache-control": "no-cache",
    "postman-token": "52551a61-50dd-4b20-9dab-26fbb82cfee6",
    host: "localhost:5000",
    "accept-encoding": "gzip, deflate",
    "content-length": "38008",
    connection: "keep-alive"
  };

  return {
    request: {
      body,
      headers
    },
    proxy: {
      body: body ? JSON.stringify(body) : null,
      resource,
      path,
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
      headers: {
        ...headers,
        ...{
          "CloudFront-Forwarded-Proto": "https",
          "CloudFront-Is-Desktop-Viewer": "true",
          "CloudFront-Is-Mobile-Viewer": "false",
          "CloudFront-Is-SmartTV-Viewer": "false",
          "CloudFront-Is-Tablet-Viewer": "false",
          "CloudFront-Viewer-Country": "US",
          "Upgrade-Insecure-Requests": "1",
          Via:
            "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
          "X-Amz-Cf-Id":
            "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
          "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
          "X-Forwarded-Port": "443",
          "X-Forwarded-Proto": "https"
        }
      },
      requestContext: {
        accountId,
        resourceId: "123456",
        stage,
        requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
        requestTime: "09/Apr/2015:12:34:56 +0000",
        requestTimeEpoch: 1428582896000,
        authorizer: {
          claims
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
        path: `/${stage}/${path}`,
        resourcePath: resource,
        httpMethod: method,
        apiId: "1234567890",
        protocol: "HTTP/1.1"
      }
    }
  };
};
