import VERSION from "./version.generated.json";
import type { ApiRoute } from "./types";

import { images } from "./api/images";
import { profile, Nicholas } from "./api/profile";

/**
 * The application logic. Routes are defined here as functions.
 */
export const app: { [apiPath: string]: ApiRoute } = {
  /**
   * Ping route for health checks
   * @returns "pong!" as response object with an optional status code, headers and a message
   */
  ping() {
    return Promise.resolve({
      headers: { "Content-Type": "text/plain" },
      message: "pong!",
    });
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
    return Promise.resolve({
      message: {
        node: process.versions.node,
        ...VERSION,
      },
    });
  },

  images,

  profile,
  Nicholas,
};
