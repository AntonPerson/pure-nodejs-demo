import { ApiRequest, ApiResponse } from "../types";
import { fetchData, handleExternalError, ExternalApiError } from "../utils";
import type { User, Post } from "../types";
/**
 * Fetches and aggregates user and post data from external APIs.
 *
 * @param route - The API route for the current request.
 * @param getUserId - A function to extract the user ID from the API request.
 * @param urlUsers - The URL of the external API to fetch user data.
 * @param urlPosts - The URL of the external API to fetch post data.
 * @returns A function that accepts an optional API request and returns a Promise of ApiResponse.
 */
export function fetchAndAggregate(
  route: string,
  getUserId: (req?: ApiRequest) => number,
  urlUsers: string,
  urlPosts: string
) {
  return async (req?: ApiRequest): Promise<ApiResponse> => {
    // Get the user ID from the API request
    const userId = getUserId(req);
    // Validate the user ID
    if (userId === undefined || Number.isNaN(userId)) {
      return {
        status: 400,
        message: {
          type: "ERROR",
          error: "Invalid query parameters.",
          solution:
            "Need something like ?userId=1, " +
            "where userId is the id of the user to fetch.",
        },
      };
    }

    // Fetch the data from the external API
    const results = await Promise.allSettled([
      fetchData<User[]>(urlUsers),
      fetchData<Post[]>(urlPosts),
    ]);

    // Check if the promises have been fulfilled and assign the values
    const allUsers =
      results[0].status === "fulfilled" ? results[0].value : null;
    const allPosts =
      results[1].status === "fulfilled" ? results[1].value : null;

    // Validate the fetched data
    if (!Array.isArray(allUsers) || !Array.isArray(allPosts)) {
      return handleExternalError({
        route,
        params: { userId },
      })(
        new ExternalApiError("Failed to fetch data from external API.", {
          users:
            results[0].status === "fulfilled"
              ? null
              : { error: results[0].reason.toString(), url: urlUsers },
          posts:
            results[1].status === "fulfilled"
              ? null
              : { error: results[1].reason.toString(), url: urlPosts },
        })
      );
    }

    // Find the requested user and their posts
    const user = allUsers.find((user) => user.id === userId);
    const posts = allPosts
      .filter((post) => post.userId === userId)
      .map((post) => ({ ...post, userId: undefined }));

    // Check if the user was found
    if (!user) {
      return {
        status: 404,
        message: {
          type: "ERROR",
          error: "User not found",
          solution: "Try a different userId",
        },
      };
    }

    // Return the aggregated user and posts data
    return {
      message: {
        type: "AGGREGATION",
        user,
        posts,
      },
    };
  };
}

export const profile = fetchAndAggregate(
  "/profile",
  (req) => parseInt(req?.query?.userId as string, 10),
  "https://jsonplaceholder.typicode.com/users",
  "https://jsonplaceholder.typicode.com/posts"
);
export const Nicholas = fetchAndAggregate(
  "/Nicholas",
  () => 8,
  "https://jsonplaceholder.typicode.com/users",
  "https://jsonplaceholder.typicode.com/posts"
);
