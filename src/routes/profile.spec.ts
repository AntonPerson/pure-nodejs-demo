import { expect, it, describe, beforeEach, vi } from "vitest";

import { mockPosts } from "../data/post.mock";
import { mockUsers } from "../data/user.mock";

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
        body: {
          type: "AGGREGATION",
          data: {
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
        },
      });
    });

    it("returns 500 when API call fails", async () => {
      vi.mocked(fetchData).mockRejectedValue(new Error("Something went wrong"));
      // We need to mock console.error to avoid the error message from being logged to the console
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

      const fetchAndAggregateTest = fetchAndAggregate(
        "/test",
        () => 2,
        "https://jsonplaceholder.typicode.com/users",
        "https://jsonplaceholder.typicode.com/posts"
      );

      // First we make sure that we are not accidentally returning the real data
      expect(vi.isMockFunction(fetchData)).toBeTruthy();

      const result = await fetchAndAggregateTest();

      const expectedError = expect.objectContaining({
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
      });

      expect(fetchData).toHaveBeenCalled();
      expect(result).toEqual({
        status: 500,
        body: { type: "ERROR", error: expectedError },
      });
      const errorLogEntry = JSON.parse(errorLog.mock.calls[0][0]);
      expect(errorLogEntry).toEqual(expectedError);
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
        body: {
          type: "ERROR",
          error: {
            message: "User not found",
            solution: "Try a different userId",
          },
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
        body: {
          type: "ERROR",
          error: {
            message: "Invalid query parameters.",
            solution:
              "Need something like ?userId=1, " +
              "where userId is the id of the user to fetch.",
          },
        },
      });
    });
  });
});
