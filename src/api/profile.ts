import { ApiRequest, ApiResponse } from "../types";
import { fetchData } from "../utils";
import {
  handleExternalError,
  unwrapError,
  wrapError,
} from "../utils/handleExternalError";

export type Address = {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: {
    lat: string;
    lng: string;
  };
};

export type Company = {
  name: string;
  catchPhrase: string;
  bs: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
};

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export function fetchAndAggregate(
  route: string,
  getUserId: (req?: ApiRequest) => number,
  urlUsers: string,
  urlPosts: string
) {
  return async (req?: ApiRequest): Promise<ApiResponse> => {
    const userId = getUserId(req);
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

    try {
      // Fetch the data from the external API
      // Note that we use Promise.all to fetch both users and posts in parallel
      // and fail fast if either of the requests fail.
      // An alternative would be to use Promise.allSettled and return an error
      // if either of the requests fail.
      // Here we assume that both requests are equally important and both needed for this feature.
      const [allUsers, allPosts] = await Promise.all([
        fetchData<User[]>(urlUsers).catch(wrapError("users", urlUsers)),
        fetchData<Post[]>(urlPosts).catch(wrapError("posts", urlPosts)),
      ]);
      if (!Array.isArray(allUsers) || !Array.isArray(allPosts)) {
        return {
          status: 500,
          message: {
            type: "ERROR",
            error: `Failed to fetch data from external API. Expected an array for ${[
              Array.isArray(allUsers) ? "users" : "",
              Array.isArray(allPosts) ? "posts" : "",
            ]}.`,
            solution: "Try again later or update the configuration.",
          },
        };
      }

      const user = allUsers.find((user) => user.id === userId);
      const posts = allPosts
        .filter((post) => post.userId === userId)
        .map((post) => ({ ...post, userId: undefined }));

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
      return {
        message: {
          type: "AGGREGATION",
          user,
          posts,
        },
      };
    } catch (error) {
      const { apiName, apiUrl } = unwrapError(error);
      // Handle the external error by logging it and returning a 500 status code
      return handleExternalError({
        route,
        params: { userId },
        apiName,
        apiUrl,
      })(error as Error);
    }
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
