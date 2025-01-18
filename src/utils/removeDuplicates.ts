// utils.ts

export const removeDuplicates = <T>(array: T[], key: keyof T): T[] => {
  const unique: T[] = [];
  const seen = new Set();
  array.forEach(item => {
    const value = item[key];
    if (!seen.has(value)) {
      seen.add(value);
      unique.push(item);
    }
  });
  return unique;
};
