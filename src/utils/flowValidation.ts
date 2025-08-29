/**
 * Utility functions for validating flow IDs across the application
 */

/**
 * Validates if a flowId is valid for string type
 * @param flowId - The flow ID to validate (string, null, or undefined)
 * @returns true if flowId is a non-empty string, false otherwise
 */
export const isValidStringFlowId = (flowId: string | null | undefined): flowId is string => {
  return typeof flowId === 'string' && flowId.trim().length > 0;
};

/**
 * Validates if a flowId is valid for number type
 * @param flowId - The flow ID to validate (number, null, or undefined)
 * @returns true if flowId is a positive number, false otherwise
 */
export const isValidNumberFlowId = (flowId: number | null | undefined): flowId is number => {
  return typeof flowId === 'number' && flowId > 0;
};

/**
 * Validates if a flowId is valid for mixed types (string or number)
 * @param flowId - The flow ID to validate (string, number, null, or undefined)
 * @returns true if flowId is valid, false otherwise
 */
export const isValidFlowId = (flowId: string | number | null | undefined): boolean => {
  if (typeof flowId === 'number') {
    return flowId > 0;
  }
  if (typeof flowId === 'string') {
    const trimmed = flowId.trim();
    if (trimmed.length === 0) return false;
    
    // Check if it's a numeric string
    const numId = parseInt(trimmed, 10);
    return !isNaN(numId) && numId > 0;
  }
  return false;
};

/**
 * Logs a warning for invalid flow ID with context
 * @param context - The context where the validation failed (e.g., component name)
 * @param flowId - The invalid flow ID
 * @param action - The action that was attempted (optional)
 */
export const logInvalidFlowId = (
  context: string, 
  flowId: string | number | null | undefined, 
  action?: string
): void => {
  const actionText = action ? ` for ${action}` : '';
  console.warn(`${context}: Invalid or missing flow ID${actionText}`, { flowId });
};

/**
 * Logs an error for invalid flow ID with context
 * @param context - The context where the validation failed (e.g., component name)
 * @param flowId - The invalid flow ID
 * @param action - The action that was attempted (optional)
 */
export const logInvalidFlowIdError = (
  context: string, 
  flowId: string | number | null | undefined, 
  action?: string
): void => {
  const actionText = action ? ` for ${action}` : '';
  console.error(`${context}: Cannot proceed with invalid flow ID${actionText}`, { flowId });
};