import http from "node:http";
import https from "node:https";

/**
 * Fetches data from the specified URL using the HTTP or HTTPS protocol and returns the data as a Promise of the specified type.
 * Automatically parses the response data as JSON.
 *
 * @typeparam T The type of the expected response data, defaults to unknown.
 * @param url The URL to fetch data from.
 * @returns A Promise resolving to the fetched data of type T or rejecting with an error if the request fails.
 *
 * @example
 * fetchData<Array<Image>>("https://jsonplaceholder.typicode.com/photos")
 *   .then(images => {
 *     console.log(images);
 *   })
 *   .catch(err => {
 *     console.error(err);
 *   });
 */
export function fetchData<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    (url.startsWith("https") ? https : http)
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
