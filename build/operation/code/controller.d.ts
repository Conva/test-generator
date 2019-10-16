interface ControllerOperationOptions<ResponseType extends {}> {
    claims?: {};
    endpoint: string;
    expected: {
        body?: ResponseType;
        statusCode: number;
    };
}
export declare type GetControllerOperation<ResponseType extends {}> = {
    type: "GET";
} & ControllerOperationOptions<ResponseType>;
export declare type PostControllerOperation<ResponseType extends {}> = {
    type: "POST";
    postBody: {};
} & ControllerOperationOptions<ResponseType>;
export declare type ControllerOperation<ResponseType extends {}> = (GetControllerOperation<ResponseType> | PostControllerOperation<ResponseType>) & {
    operationType: "controller";
};
export {};
