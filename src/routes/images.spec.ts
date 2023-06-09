import { expect, it, describe, afterEach, beforeEach, vi } from "vitest";

import type { Image } from "../types";

// Mock the fetchData function to return a predictable list of images
const mockImages: Image[] = Array.from({ length: 20 }, (_, index) => ({
  albumId: 1,
  id: index + 1,
  title: `Image ${index + 1}`,
  url: `https://via.placeholder.com/600/${index + 1}`,
  thumbnailUrl: `https://via.placeholder.com/150/${index + 1}`,
}));

// vi.mock(...) needs to be hoisted to the top of the file, which has some problems with wallaby, so we use vi.doMock(...) instead.
vi.doMock("../utils/fetchData");

describe("images", async () => {
  // We import the images function after the fetchData mock has been set up.
  // This way wallaby has no problems with hoisting the vi.mock(...) to the top of the file.
  const images = (await import("./images")).images;
  // The fetchData mock needs to be imported separately to make assertions on it.
  const fetchData = (await import("../utils/fetchData")).fetchData;

  // Restore all mocks after before each test to avoid side effects
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(fetchData).mockResolvedValue(mockImages);
  });

  it("should return an error when size is invalid", async () => {
    const result = await images({ query: { size: "invalid" } });
    expect(result).toEqual({
      status: 400,
      body: {
        type: "ERROR",
        error: {
          message: "Invalid query parameters.",
          solution: expect.any(String),
        },
      },
    });
  });

  it("should return an error when offset is invalid", async () => {
    const result = await images({ query: { offset: "invalid" } });
    expect(result).toEqual({
      status: 400,
      body: {
        type: "ERROR",
        error: {
          message: "Invalid query parameters.",
          solution: expect.any(String),
        },
      },
    });
  });

  it("should return images 11 and 12 when size is 2 and offset is 5", async () => {
    const result = await images({ query: { size: "2", offset: "5" } });

    // First we make sure that we are not accidentally returning the real data
    expect(vi.isMockFunction(fetchData)).toBeTruthy();
    expect(fetchData).toHaveBeenCalled();

    // Then we make sure that the function returns the correct data
    expect(result).toEqual({
      body: {
        type: "PAGINATION",
        data: [
          {
            albumId: 1,
            id: 11,
            title: "Image 11",
            url: "https://via.placeholder.com/600/11",
            thumbnailUrl: "https://via.placeholder.com/150/11",
          },
          {
            albumId: 1,
            id: 12,
            title: "Image 12",
            url: "https://via.placeholder.com/600/12",
            thumbnailUrl: "https://via.placeholder.com/150/12",
          },
        ],
        remaining: 8,
      },
    });
  });

  it("should return images 1 to 10 when size is 10 and offset is 0 (default)", async () => {
    const result = await images();

    // First we make sure that we are not accidentally returning the real data
    expect(vi.isMockFunction(fetchData)).toBeTruthy();
    expect(fetchData).toHaveBeenCalled();

    // Then we make sure that the function returns the correct data
    expect(result).toEqual({
      body: {
        type: "PAGINATION",
        data: mockImages.slice(0, 10),
        remaining: 10,
      },
    });
  });

  it("should just return the response unchanged if the response is not an array", async () => {
    vi.mocked(fetchData).mockResolvedValue({ foo: "bar" });
    const result = await images();

    // First we make sure that we are not accidentally returning the real data
    expect(vi.isMockFunction(fetchData)).toBeTruthy();
    expect(fetchData).toHaveBeenCalled();

    // Then we make sure that the function returns the correct data
    expect(result).toEqual({
      body: {
        type: "PAGINATION",
        data: { foo: "bar" },
        remaining: 0,
      },
    });
  });

  it("should be able to extract an array if it is wrapped in an object", async () => {
    vi.mocked(fetchData).mockResolvedValue({ data: mockImages });
    const result = await images();

    // First we make sure that we are not accidentally returning the real data
    expect(vi.isMockFunction(fetchData)).toBeTruthy();
    expect(fetchData).toHaveBeenCalled();

    // Then we make sure that the function returns the correct data
    expect(result).toEqual({
      body: {
        type: "PAGINATION",
        data: mockImages.slice(0, 10),
        remaining: 10,
      },
    });
  });

  // Make sure that the NODE_ENV variable is reset to "test" after each test to avoid side effects
  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  it("should return a 500 error without internals when in production", async () => {
    vi.mocked(fetchData).mockRejectedValue(new Error("Something went wrong"));
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    // Manipulate the NODE_ENV variable to simulate production
    process.env.NODE_ENV = "production";
    const result = await images();

    const errorLogEntry = JSON.parse(errorLog.mock.calls[0][0]);
    expect(errorLogEntry, "errorLogEntry").toContain({
      message: "Failed to fetch data from external API.",
    });
    // The log always shows the real error.
    expect(errorLogEntry.extra.images, "errorLogEntry.extra.images").toContain({
      error: "Error: Something went wrong",
      url: "https://jsonplaceholder.typicode.com/photos",
    });

    expect(result).toEqual({
      status: 500,
      body: {
        // In production mode the response only shows error name, errorId and solution, no internals like stack.
        type: "ERROR",
        error: {
          message: "Failed to fetch data from external API.",
          solution: expect.stringContaining(
            "Try again later or contact support."
          ),
          errorId: expect.any(String),
        },
      },
    });
  });

  it("should return a 500 error when the external API returns an error", async () => {
    vi.mocked(fetchData).mockRejectedValue(new Error("Something went wrong"));
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await images();

    const errorLogEntry = JSON.parse(errorLog.mock.calls[0][0]);
    expect(errorLogEntry, "errorLogEntry").toContain({
      message: "Failed to fetch data from external API.",
    });
    // The log always shows the real error.
    expect(errorLogEntry.extra.images, "errorLogEntry.extra.images").toContain({
      error: "Error: Something went wrong",
      url: "https://jsonplaceholder.typicode.com/photos",
    });
    expect(result.status, "api status").toBe(500);
    expect(result.body, "api response").toEqual({
      type: "ERROR",
      error: expect.objectContaining({
        message: "Failed to fetch data from external API.",
      }),
    });
    // In development mode the response shows the real error.
    expect(
      (result.body as { error: { extra: unknown } })?.error?.extra,
      "extra"
    ).toEqual({
      images: {
        error: "Error: Something went wrong",
        url: "https://jsonplaceholder.typicode.com/photos",
      },
    });
  });
});
