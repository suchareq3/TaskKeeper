// Store the original console.error function
const originalConsoleError = console.error;

// Reference to the error handler function that will be set by setupErrorHandling
let errorHandler: (message: string, ...optionalParams: any[]) => void = () => {};

// Flag to prevent recursive calls
let isHandlingError = false;

// Override console.error to use our error handler
console.error = function(message: any, ...optionalParams: any[]) {
  // Always call the original console.error for debugging
  originalConsoleError.apply(console, [message, ...optionalParams]);
  
  // Prevent recursive calls that could cause infinite loops
  if (isHandlingError) {
    return;
  }
  
  try {
    // Set flag to prevent recursive calls
    isHandlingError = true;
    
    // Format the error message
    let errorMessage = '';
    
    if (message instanceof Error) {
      errorMessage = message.message;
    } else if (typeof message === 'string') {
      errorMessage = message;
    } else if (message && typeof message === 'object') {
      try {
        errorMessage = JSON.stringify(message);
      } catch (e) {
        errorMessage = 'An error occurred';
      }
    } else {
      errorMessage = String(message);
    }
    
    // Call our error handler with the formatted message
    errorHandler(errorMessage, ...optionalParams);
  } finally {
    // Reset flag
    isHandlingError = false;
  }
};

/**
 * Setup global error handling
 * @param handler Function to handle errors
 */
export function setupErrorHandling(handler: (message: string, ...optionalParams: any[]) => void) {
  errorHandler = handler;
}

/**
 * Utility function to safely handle errors
 * @param fn Function to execute
 * @param errorContext Context description for error messages
 * @returns Promise that resolves to the result of fn or rejects with an error
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorContext: string = 'Operation'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Log the error but preserve the original error object
    console.error(`Error in ${errorContext}:`, error);
    // Don't modify the error object, just rethrow it
    throw error;
  }
}

/**
 * Utility function to safely handle errors in synchronous functions
 * @param fn Function to execute
 * @param errorContext Context description for error messages
 * @returns Result of fn or undefined if an error occurred
 */
export function safeExecuteSync<T>(
  fn: () => T,
  errorContext: string = 'Operation'
): T | undefined {
  try {
    return fn();
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    return undefined;
  }
}
