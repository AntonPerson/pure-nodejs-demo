export type ApiRequest<Q = any> = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Q;
};

export type ApiResponse<B = string | Record<string, unknown>> = {
  status?: number;
  headers?: Record<string, string>;
  body?: B;
};

export type ApiBody<T> = {
  type: string | "ERROR";
  // SUCCESS
  data?: T;
  // ERROR
  error?: {
    message?: string;
    solution?: string;
    errorId?: string;
  };
};

export type ApiRoute = (req?: ApiRequest) => Promise<ApiResponse>;
