import { ApiRequest, ApiResponse } from "../types";
import { fetchData, handleExternalError, ExternalApiError } from "../utils";

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

    // Fetch the data from the external API
    const results = await Promise.allSettled([
      fetchData<User[]>(urlUsers),
      fetchData<Post[]>(urlPosts),
    ]);

    const allUsers =
      results[0].status === "fulfilled" ? results[0].value : null;
    const allPosts =
      results[1].status === "fulfilled" ? results[1].value : null;

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
