import http from "node:http";
import { app } from "./app";

const PORT = process.env.PORT || 8040;

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
  const route = req.url?.split("/")[1];

  if (route && app[route] && req.method === "GET") {
    // Call the route function and get the response
    const result = app[route]({ method: req.method });

    // Headers and status
    res.writeHead(
      result.status || 200,
      result.headers || { "Content-Type": "application/json" }
    );
    // Body of the response
    if (result.message) {
      res.write(
        typeof result.message === "string"
          ? result.message
          : JSON.stringify(result.message)
      );
    }
    // End and send the response
    res.end();
  } else {
    // If no suitable route could be found,
    // return a 404 response with a JSON body
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
};

// Start the server and listen for requests
http.createServer(requestListener).listen(PORT, () => {
  console.log(`server started on port: ${PORT}`);
});
