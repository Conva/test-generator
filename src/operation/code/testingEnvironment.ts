export type TestingEnvironment = Partial<{
  guid: string;
  time: Date;
  [index: string]: Date | string;
}>;

export type TestingEnvironmentOperation = {
  operationType: "testingEnvironment";
  testingEnvironment: TestingEnvironment;
};
