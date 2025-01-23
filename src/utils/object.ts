export const parseStringifiedJson = (
  value: string
): [boolean, unknown] => {
  try {
    let parsedValue = JSON.parse(value);
    if (typeof parsedValue === 'string') {
      parsedValue = JSON.parse(parsedValue);
    }
    return [true, parsedValue];
  } catch (error) {
    console.error("ERROR", error);
    return [false, null];
  }
};