/**
 * Extracts the array from the response if it is wrapped in an object.
 * Otherwise returns the response unchanged.
 * @param response The response to extract the array from.
 * @returns The extracted array or the response unchanged.
 */
function extractArray<T>(
  response: T[] | Record<string, unknown>
): T[] | Record<string, unknown> {
  // Already an array
  if (Array.isArray(response)) {
    return response;
  }
  // Sometimes the response might be wrapped in an object
  if (typeof response === "object") {
    const key = Object.keys(response).find((key) =>
      Array.isArray(response[key])
    );
    return key ? (response[key] as T[]) : response;
  }
  // Not possible to paginate this
  return response;
}

/**
 * The paginate function returns a paginated subset of the data based on the specified size and offset.
 * Size limits the number of items per page and offset specifies the page number.
 *
 * @typeparam T The type of the expected response data.
 * @param allData The data to paginate. Hopefully an array, but an object with an array property is also supported.
 * @param size The number of items per page.
 * @param offset The page number.
 * @returns A Promise resolving to an object containing the paginated data and the remaining number of items.
 */
export function paginate<T>(
  allData: T[] | Record<string, unknown>,
  size: number,
  offset: number
): {
  body: {
    type: "PAGINATION";
    data: T[] | Record<string, unknown>;
    remaining: number;
  };
} {
  const extracted = extractArray(allData);
  const data = Array.isArray(extracted)
    ? extracted.slice(offset * size, offset * size + size)
    : extracted;
  const remaining = Math.max(
    0,
    (Array.isArray(extracted) ? extracted.length : 0) - (offset * size + size)
  );

  return { body: { type: "PAGINATION", data, remaining } };
}
