export type ApiRequest<Q = any> = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Q;
};

export type ApiResponse = {
  status?: number;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
};

export type ApiRoute = (req?: ApiRequest) => Promise<ApiResponse>;
