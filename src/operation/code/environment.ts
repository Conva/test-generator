export type Environment = Partial<{
  guid: string;
  time: Date | string;
  [index: string]: Date | string;
}>;

export type EnvironmentOperation = {
  operationType: "environment";
  environment: Environment;
};
