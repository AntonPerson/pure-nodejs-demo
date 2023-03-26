import http from "node:http";

const PORT = process.env.PORT || 8040;

type ApiRequest = {
  method: string;
};

type ApiResponse = {
  status?: number;
  headers?: http.OutgoingHttpHeaders;
  message: string;
};

type ApiRoute = (req: ApiRequest) => ApiResponse;

/**
 * The application logic. Routes are defined here as functions.
 */
const app: { [apiPath: string]: ApiRoute } = {
  ping() {
    return {
      headers: { "Content-Type": "text/plain" },
      message: "pong!",
    };
  },
};

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
  const apiPath = req.url?.split("/")[1];

  if (apiPath && app[apiPath] && req.method === "GET") {
    const result = app[apiPath]({ method: req.method });
    // Headers and status
    res.writeHead(
      result.status || 200,
      result.headers || { "Content-Type": "application/json" }
    );
    // Body of the response
    res.write(result.message);
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
