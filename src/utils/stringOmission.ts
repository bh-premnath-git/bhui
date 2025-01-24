function omitSpaceSymbolNumeric(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '');
  }
  export { omitSpaceSymbolNumeric }