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
  urlUsers: string,
  urlPosts: string
) {
  return async (req?: ApiRequest): Promise<ApiResponse> => {
    // Extract the query parameters
    const query = (req?.query as { id: string }) ?? {};
    const userId = parseInt(query.id ?? "8", 10);

    try {
      // Fetch the data from the external API
      const [allUsers, allPosts] = await Promise.all([
        fetchData<User[]>(urlUsers).catch(wrapError("users", urlUsers)),
        fetchData<Post[]>(urlPosts).catch(wrapError("posts", urlPosts)),
      ]);
      const user = allUsers.find((user) => user.id === userId);
      const posts = allPosts
        .filter((post) => post.userId === userId)
        .map((post) => ({ ...post, userId: undefined }));

      return {
        message: {
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
  "https://jsonplaceholder.typicode.com/users",
  "https://jsonplaceholder.typicode.com/posts"
);
export const Nicholas = fetchAndAggregate(
  "/Nicholas",
  "https://jsonplaceholder.typicode.com/users",
  "https://jsonplaceholder.typicode.com/posts"
);
