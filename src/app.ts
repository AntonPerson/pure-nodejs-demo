type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

type ApiResponse = {
  status?: number;
  headers?: Record<string, string>;
  message?: string | Record<string, unknown>;
};

type ApiRoute = (req?: ApiRequest) => ApiResponse;

/**
 * The application logic. Routes are defined here as functions.
 */
export const app: { [apiPath: string]: ApiRoute } = {
  /**
   * Ping route for health checks
   * @returns "pong!" as response object with an optional status code, headers and a message
   */
  ping() {
    return {
      headers: { "Content-Type": "text/plain" },
      message: "pong!",
    };
  },

  /**
   * Node version route
   * @returns the Node.js version as a response object with an optional status code, headers, and a message
   */
  version() {
    return {
      headers: { "Content-Type": "text/plain" },
      message: {
        node: process.versions.node,
      },
    };
  },
};
