import type { ApiRequest, ApiResponse, ApiRoute } from "../types";
import { paginate, fetchData } from "../utils";
import { handleExternalError } from "../utils/handleExternalError";

/**
 * The Image type defines the structure of the image object fetched from an external API.
 */
export type Image = {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};

/**
 * The images function fetches a list of items from an external API and returns
 * a paginated subset of the data based on the specified size and offset.
 *
 * @param route The current route to print in the error log message.
 * @param url The URL to fetch data from.
 * @returns An api route handler function.
 */
export function fetchAndPaginate(route: string, url: string): ApiRoute {
  return async (req?: ApiRequest): Promise<ApiResponse> => {
    // Extract the query parameters
    const query = (req?.query as { size: string; offset: string }) ?? {};
    const size = parseInt(query.size ?? "10", 10);
    const offset = parseInt(query.offset ?? "0", 10);

    // Validate the query parameters
    if (Number.isNaN(size) || Number.isNaN(offset) || size < 1 || offset < 0) {
      return {
        status: 400,
        message: {
          error: "Invalid query parameters.",
          solution:
            "Need something like ?size=10&offset=0, " +
            "where offset is the page number " +
            "and size is the number of items per page.",
        },
      };
    }

    try {
      // Fetch the data from the external API
      const allData = await fetchData<Image[]>(url);
      // Return the paginated subset of the data
      return paginate(allData, size, offset);
    } catch (error) {
      // Handle the external error by logging it and returning a 500 status code
      return handleExternalError(
        // The error log message
        `| route: ${route}?offset=${offset}&size=${size} | external: ${url}`
      )(error as Error);
    }
  };
}

/**
 * The images function fetches a list of images from the external API and returns
 * a paginated subset of the data based on the specified size and offset.
 */
export const images = fetchAndPaginate(
  "/images",
  process.env.URL_IMAGES || "https://jsonplaceholder.typicode.com/photos"
);
