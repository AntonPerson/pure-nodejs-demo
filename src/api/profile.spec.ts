import { expect, it, describe, beforeEach, vi } from "vitest";

import type { User, Post } from "./profile";

// Mock data for testing
const mockUsers: User[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "Sincere@april.biz",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
      geo: {
        lat: "-37.3159",
        lng: "81.1496",
      },
    },
    phone: "1-770-736-8031 x56442",
    website: "hildegard.org",
    company: {
      name: "Romaguera-Crona",
      catchPhrase: "Multi-layered client-server neural-net",
      bs: "harness real-time e-markets",
    },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
      geo: {
        lat: "-43.9509",
        lng: "-34.4618",
      },
    },
    phone: "010-692-6593 x09125",
    website: "anastasia.net",
    company: {
      name: "Deckow-Crist",
      catchPhrase: "Proactive didactic contingency",
      bs: "synergize scalable supply-chains",
    },
  },
];

const mockPosts: Post[] = [
  {
    userId: 1,
    id: 8,
    title: "dolorem dolore est ipsam",
    body: "dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae",
  },
  {
    userId: 1,
    id: 9,
    title: "nesciunt iure omnis dolorem tempora et accusantium",
    body: "consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas",
  },
  {
    userId: 2,
    id: 11,
    title: "et ea vero quia laudantium autem",
    body: "delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi",
  },
  {
    userId: 2,
    id: 12,
    title: "in quibusdam tempore odit est dolorem",
    body: "itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio",
  },
];

// Mock implementation of fetchData for testing
const fetchDataMock = <T>(url: string): Promise<T> => {
  if (url.includes("users")) {
    return Promise.resolve(mockUsers as unknown as T);
  } else if (url.includes("posts")) {
    return Promise.resolve(mockPosts as unknown as T);
  }

  throw new Error("Unknown API URL");
};

// vi.mock(...) needs to be hoisted to the top of the file, which has some problems with wallaby, so we use vi.doMock(...) instead.
vi.doMock("../utils/fetchData");

describe("profile", () => {
  describe("fetchAndAggregate", async () => {
    // We import the function under test after the fetchData mock has been set up.
    // This way wallaby has no problems with hoisting the vi.mock(...) to the top of the file.
    const fetchAndAggregate = (await import("./profile")).fetchAndAggregate;
    // The fetchData mock needs to be imported separately to make assertions on it.
    const fetchData = (await import("../utils/fetchData")).fetchData;

    // Restore all mocks after before each test to avoid side effects
    beforeEach(() => {
      vi.restoreAllMocks();
      vi.mocked(fetchData).mockImplementation(fetchDataMock);
    });

    // Test cases for fetchAndAggregate
    it("returns aggregated user and posts data", async () => {
      const fetchAndAggregateTest = fetchAndAggregate(
        "/test",
        () => 2,
        "https://jsonplaceholder.typicode.com/users",
        "https://jsonplaceholder.typicode.com/posts"
      );

      // First we make sure that we are not accidentally returning the real data
      expect(vi.isMockFunction(fetchData)).toBeTruthy();

      const result = await fetchAndAggregateTest();

      expect(fetchData).toHaveBeenCalled();
      expect(result).toEqual({
        message: {
          type: "AGGREGATION",
          user: mockUsers[1],
          posts: [
            {
              id: 11,
              title: "et ea vero quia laudantium autem",
              body: "delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi",
            },
            {
              id: 12,
              title: "in quibusdam tempore odit est dolorem",
              body: "itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio",
            },
          ],
        },
      });
    });

    it("returns 500 when API call fails", async () => {
      vi.mocked(fetchData).mockRejectedValue(new Error("Something went wrong"));

      const fetchAndAggregateTest = fetchAndAggregate(
        "/test",
        () => 2,
        "https://jsonplaceholder.typicode.com/users",
        "https://jsonplaceholder.typicode.com/posts"
      );

      // First we make sure that we are not accidentally returning the real data
      expect(vi.isMockFunction(fetchData)).toBeTruthy();

      const result = await fetchAndAggregateTest();

      expect(fetchData).toHaveBeenCalled();
      expect(result).toEqual({
        status: 500,
        message: expect.objectContaining({
          type: "ERROR",
          error: "External API error.",
          message: "Failed to fetch data from external API.",
          extra: {
            users: {
              url: "https://jsonplaceholder.typicode.com/users",
              error: "Error: Something went wrong",
            },
            posts: {
              url: "https://jsonplaceholder.typicode.com/posts",
              error: "Error: Something went wrong",
            },
          },
        }),
      });
    });

    it("returns 404 when user not found", async () => {
      const fetchAndAggregateTest = fetchAndAggregate(
        "/test",
        () => 999,
        "https://jsonplaceholder.typicode.com/users",
        "https://jsonplaceholder.typicode.com/posts"
      );

      const result = await fetchAndAggregateTest();
      expect(result).toEqual({
        status: 404,
        message: {
          type: "ERROR",
          error: "User not found",
          solution: "Try a different userId",
        },
      });
    });

    it("returns 400 when invalid query parameters", async () => {
      const fetchAndAggregateTest = fetchAndAggregate(
        "/test",
        () => NaN,
        "https://jsonplaceholder.typicode.com/users",
        "https://jsonplaceholder.typicode.com/posts"
      );

      const result = await fetchAndAggregateTest();
      expect(result).toEqual({
        status: 400,
        message: {
          type: "ERROR",
          error: "Invalid query parameters.",
          solution:
            "Need something like ?userId=1, " +
            "where userId is the id of the user to fetch.",
        },
      });
    });
  });
});
