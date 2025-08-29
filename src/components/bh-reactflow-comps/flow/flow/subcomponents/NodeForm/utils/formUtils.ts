/** True when a value is "empty" for our form‑validation purposes. */
export const isFieldEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  
  // Special handling for lookup_conditions object
  if (typeof value === "object" && value.hasOwnProperty('column_name') && value.hasOwnProperty('lookup_with')) {
    return !value.column_name || !value.lookup_with || 
           value.column_name.trim() === "" || value.lookup_with.trim() === "";
  }
  
  return false;
};

/** Recursively convert literal strings ("true", "42") to booleans / numbers. */
export const convertLiteralStrings = (obj: any): any => {
  if (typeof obj === "string") {
    if (obj === "true") return true;
    if (obj === "false") return false;
    const n = Number(obj);
    return isNaN(n) || obj === "" ? obj : n;
  }
  if (Array.isArray(obj)) return obj.map(convertLiteralStrings);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertLiteralStrings(v)])
    );
  }
  return obj;
}; 