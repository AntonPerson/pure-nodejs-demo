/**
 * A type representing a generic error object, containing all relevant error properties.
 */
export type GenericError = {
  errorId: string;
  name: string;
  message: string;
  stack?: string;
  code?: string;
  errno?: string;
  syscall?: string;
  path?: string;
  address?: string;
  port?: string;
  status?: number;
};

/**
 * The serializeErrorForLog function takes an Error object and serializes it into a GenericError object.
 * This is useful for logging errors with relevant properties.
 *
 * @param error An instance of an Error object.
 * @returns A GenericError object containing all relevant properties.
 */
export function serializeErrorForLog(error: Error): GenericError {
  const errorId = Math.random().toString(36).substring(2, 9);

  const serializedError: GenericError = {
    errorId,
    name: error.name,
    message: error.message,
  };

  const err = error as GenericError;

  if ("status" in error) {
    serializedError.status = err.status;
  }
  if (err.code) {
    serializedError.code = err.code;
  }
  if (err.errno) {
    serializedError.errno = err.errno;
  }
  if (err.syscall) {
    serializedError.syscall = err.syscall;
  }
  if (err.path) {
    serializedError.path = err.path;
  }
  if (err.address) {
    serializedError.address = err.address;
  }
  if (err.port) {
    serializedError.port = err.port;
  }
  if (err.stack) {
    serializedError.stack = err.stack;
  }

  return serializedError;
}

/**
 * A type representing the extended properties of an Error object.
 * These properties are route-specific and are used to log the error.
 */
type ErrorExtension = {
  route?: string;
  apiName?: string;
  apiUrl?: string;
  params?: Record<string, unknown>;
};

/**
 * The handleExternalError function is a higher-order function that takes an ErrorExtension object
 * and returns a function that takes an Error object and handles it, typically by logging and
 * returning a formatted error response.
 *
 * In production environments, the error response will only contain a generic error message and an error ID.
 *
 * @param errorExtension An object containing extended properties of the Error object.
 * @returns A function that takes an Error object and returns a formatted error response.
 */
export function handleExternalError(errorExtension: ErrorExtension) {
  return <E extends Error>(error: E) => {
    const { status, ...serializedError } = {
      type: "ERROR",
      error: "External API error.",
      ...errorExtension,
      ...serializeErrorForLog(error),
    };
    console.error(JSON.stringify(serializedError, null, 2), ",");

    if (process.env.NODE_ENV === "production") {
      return {
        status: status || 500,
        message: {
          type: "ERROR",
          error: `Failed to fetch data from external API. (${serializedError.name})`,
          solution: `Try again later or contact support. (Error ID: ${serializedError.errorId})`,
          errorId: serializedError.errorId,
        },
      };
    }

    return {
      status: status || 500,
      message: serializedError,
    };
  };
}

/**
 * A class representing an error from an external API. It extends the built-in Error class
 * and includes additional properties, such as the name of the external API and its URL.
 *
 * This way calls to multiple external APIs can be wrapped in a try/catch block
 * and the error can be handled in a single place.
 */
class ExternalApiError extends Error {
  constructor(message: string, public apiName: string, public apiUrl: string) {
    super(message);
  }
}

/**
 * A higher-order function that wraps a given error with an ExternalApiError object,
 * adding the provided API name and URL to the error.
 *
 * @param apiName The name of the external API.
 * @param apiUrl The URL of the external API.
 * @returns A function that takes an error and throws it as an ExternalApiError.
 */
export function wrapError(apiName: string, apiUrl: string) {
  return <E extends Error>(error: E) => {
    throw new ExternalApiError(error.message, apiName, apiUrl);
  };
}

/**
 * The unwrapError function takes an error object and extracts relevant information
 * from ExternalApiError, such as the name and url of the external API.
 *
 * @param error An error object, which can be an instance of ExternalApiError, Error, or any unknown error.
 * @returns An object containing the extracted API name, API URL, and error message.
 */
export function unwrapError(error: unknown): {
  apiName: string;
  apiUrl: string;
  message: string;
} {
  if (error instanceof ExternalApiError) {
    return {
      message: error.message,
      apiName: error.apiName,
      apiUrl: error.apiUrl,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Unknown error message",
    apiName: "unknown",
    apiUrl: "unknown",
  };
}
