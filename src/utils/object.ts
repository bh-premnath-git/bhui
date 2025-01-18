 export const isStringifiedJson = (value: string): boolean => {
    try {
      const parsedValue = JSON.parse(value);
      return typeof parsedValue === 'object' && parsedValue !== null;
    } catch (error) {
      return false;
    }
  };