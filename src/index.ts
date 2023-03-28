import http from "node:http";
import { parse } from "node:url";
import { app } from "./app";
import { handleError } from "./utils";

const PORT = process.env.PORT || 8040;
const DEFAULT_HEADERS = { "Content-Type": "application/json;charset=utf-8" };

/**
 * Create a request listener to handle requests.
 * No specific application logic is handled here ( @see app ), it's just plumbing.
 *
 * @param req - the request object
 * @param res - the response object
 */
const requestListener: http.RequestListener<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
> = (req, res) => {
  // Parse the URL and query parameters
  const parsedUrl = parse(req.url || "", true);
  const route = parsedUrl.pathname?.split("/")[1];

  if (route && app[route] && req.method === "GET") {
    // Call the route function and get the response
    app[route]({ method: req.method, query: parsedUrl.query })
      .then((result) => {
        // Headers and status
        res.writeHead(result.status || 200, result.headers || DEFAULT_HEADERS);
        // Body of the response
        if (result.body) {
          res.write(
            typeof result.body === "string"
              ? result.body
              : JSON.stringify(result.body)
          );
        }
        // End and send the response
        res.end();
      })
      .catch((error) => {
        // Handle the external error by logging it and returning a 500 status code
        const { status, body } = handleError({
          route,
          params: parsedUrl.query,
        })(error);
        // Headers and status
        res.writeHead(status, DEFAULT_HEADERS);
        // Body of the response
        res.write(JSON.stringify(body));
        // End and send the response
        res.end();
      });
  } else {
    // If no suitable route could be found,
    // return a 404 response with a JSON body
    res.writeHead(404, DEFAULT_HEADERS);
    res.end(JSON.stringify({ message: "Route not found" }));
  }
};

// Start the server and listen for requests
http.createServer(requestListener).listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
