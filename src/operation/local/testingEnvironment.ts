import { PassingType } from "../passing";

export type TestingEnvironmentOperation = Partial<{
  guid: PassingType<string>;
  time: PassingType<Date>;
  [index: string]: PassingType<Date> | PassingType<string>;
}>;
