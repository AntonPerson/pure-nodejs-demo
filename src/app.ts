type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

type ApiResponse = {
  status?: number;
  headers?: Record<string, string>;
  message?: string;
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
};
