export type ApiRequest<Q = Record<string, string | string[] | undefined>> = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Q;
};

export type ApiResponse = {
  status?: number;
  headers?: Record<string, string>;
  message?: string | Record<string, unknown>;
};

export type ApiRoute = (req?: ApiRequest) => Promise<ApiResponse>;
