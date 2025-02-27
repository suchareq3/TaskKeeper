/**
 * Test functions for error handling
 * These functions can be used to test the error handling system
 */

/**
 * Simulates an error to test the error handling system
 * @param message Optional custom error message
 */
export function simulateError(message: string = 'Test error message') {
  console.error(message);
}

/**
 * Simulates an error with an Error object
 * @param message Optional custom error message
 */
export function simulateErrorObject(message: string = 'Test error object') {
  console.error(new Error(message));
}

/**
 * Simulates a promise rejection
 * @param message Optional custom error message
 */
export function simulatePromiseRejection(message: string = 'Test promise rejection') {
  return Promise.reject(new Error(message));
}
