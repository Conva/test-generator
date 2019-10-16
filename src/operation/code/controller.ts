interface ControllerOperationOptions<ResponseType extends {}> {
  claims?: {};
  endpoint: string;
  expected: {
    body?: ResponseType;
    statusCode: number;
  };
}

export type GetControllerOperation<ResponseType extends {}> = {
  type: "GET";
} & ControllerOperationOptions<ResponseType>;

export type PostControllerOperation<ResponseType extends {}> = {
  type: "POST";
  postBody: {};
} & ControllerOperationOptions<ResponseType>;

export type ControllerOperation<ResponseType extends {}> = (
  | GetControllerOperation<ResponseType>
  | PostControllerOperation<ResponseType>) & {
  operationType: "controller";
};
