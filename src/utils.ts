import { Schema } from "./test-generator";

export const fetchSchemas = (schemaItems: Schema[]) => {
  const schema: { [type: string]: Schema } = {};
  schemaItems.map(schemaItem => {
    schema[schemaItem.title] = schemaItem;
  });
  return schema;
};

export const nestedIndex = (path: string) => {
  const indices = path.split(".").slice(1);
  const beforeIndex: string | undefined = indices[indices.length - 2];
  const lastIndex = indices[indices.length - 1];
  return { indices, lastIndex, beforeIndex };
};

const nested = <T>(object: { [key: string]: T }, path: string) => {
  const root = { ...object };
  const { indices, lastIndex, beforeIndex } = nestedIndex(path);
  //    @todo Make this more type safe
  return {
    root,
    previous: indices.slice(0, -1).reduce(
      // eslint-disable-next-line no-return-assign
      (acc, current) =>
        acc[current] !== undefined
          ? acc[current]
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (acc[current] = {} as any),
      root
    ),
    lastIndex,
    beforeIndex
  };
};

export const setNested = <T>(
  object: { [key: string]: T },
  path: string,
  value: T
) => {
  const { root, previous, lastIndex } = nested(object, path);
  previous[lastIndex] = value;
  return root;
};

export const removeNested = <T>(
  object: { [key: string]: T },
  path: string
): { [key: string]: T } => {
  const { root, previous, lastIndex, beforeIndex } = nested(object, path);
  delete previous[lastIndex];

  if (Object.keys(previous).length === 0) {
    if (beforeIndex) {
      return removeNested<T>(root, `.${beforeIndex}`);
    }
  }
  return root;
};

export const getNested = <T, C>(
  object: Partial<T>,
  path: string
): C | undefined => {
  const { previous, lastIndex } = nested(object, path);
  // @ts-ignore
  return previous[lastIndex];
};
