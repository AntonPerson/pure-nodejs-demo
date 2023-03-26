import VERSION from "./version.generated.json";

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
   * @returns response object with an optional status code, headers and a message of the following shape:
   *    - node: Node.js version
   *    - branch: Git branch
   *    - commitHash: Last commit hast
   *    - commitTimestamp: Last commit timestamp
   *    - startTimestamp: Server start timestamp
   */
  version() {
    return {
      message: {
        node: process.versions.node,
        ...VERSION,
      },
    };
  },
};
