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