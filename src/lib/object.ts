import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';

type ObjectKeys<T> = keyof T;
type CommonKeys<T, U> = ObjectKeys<T> & ObjectKeys<U>;

export const compareObjectsByKeys = <T, U>(obj1: T, obj2: U, keys: CommonKeys<T, U>[]) => {
  return isEqual(pick(obj1, keys), pick(obj2, keys));
};

export const isJsonParsed = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

export const isStringifiedJson = (value: string): boolean => {
  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === 'object' && parsedValue !== null;
  } catch (error) {
    return false;
  }
};

export const extractStringToJSON = (value: string): Object | false => {
  try {
    const parsedValue = JSON.parse(value);
    if (typeof parsedValue === 'object') {
      return parsedValue;
    }
    if (typeof value === 'string' && !!value) {
      return extractStringToJSON(parsedValue);
    }
  } catch (error) {
    return false;
  }
  return value;
};

export const getChangedValues = <T extends object>(
  object1: T,
  object2: T,
  keysToCheck: (keyof T)[]
): Partial<T> => {
  return pickBy(object2, (value, key) => {
    if (!keysToCheck.includes(key as keyof T)) {
      return false;
    }
    return !isEqual(value, object1[key]);
  });
};

export const compareByKeys = <T, U>(obj1: T, obj2: U, keys: (keyof T)[]): boolean => {
  return isEqual(pick(obj1, keys), pick(obj2, keys));
};

export const removeUndefined = (obj: Record<string, any> = {}) => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return obj;
};

export const setNestedProperty = <T>(obj: T, path: (keyof T)[], value: any): T => {
  return path.reduceRight(
    (acc, key, index) => ({
      ...((index === 0 ? obj : acc) as any),
      [key]: acc
    }),
    value
  ) as T;
};

export const parseStringifiedJson = (value: string): [boolean, unknown] => {
  try {
    let parsedValue = JSON.parse(value);
    if (typeof parsedValue === "string") {
      try {
        parsedValue = JSON.parse(parsedValue);
      } catch (innerError) {
        return [false, null];
      }
    }

    return [true, parsedValue];
  } catch (error) {
    return [false, null];
  }
};