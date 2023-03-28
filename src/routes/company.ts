import { postService, Contains } from "../services";
import { ApiRequest, ApiResponse, Post, User } from "../types";
import { ValidationError, handleExternalError } from "../utils";

export function companyNameInputValidator(req?: ApiRequest) {
  if (!req?.query?.companyName || typeof req?.query?.companyName !== "string") {
    throw new ValidationError(
      "Need something like ?companyName=Romaguera, " +
        "where companyName is the name of the company to fetch."
    );
  }

  const companyName = req?.query?.companyName as string;

  return { companyName };
}

export type CompanyQuery = {
  companyName: string;
};
export const companyRouteFactory = (
  postService: Contains<User, Post>,
  inputValidator: (req?: ApiRequest<CompanyQuery>) => {
    companyName: string;
  } = companyNameInputValidator
) =>
  function companyRoute(req?: ApiRequest<CompanyQuery>): Promise<ApiResponse> {
    const { companyName } = inputValidator(req);

    return postService
      .contains((user) => user.company?.name?.includes(companyName))
      .then((data) => ({
        body: {
          type: "FILTER",
          data,
        },
      }))
      .catch(
        handleExternalError({
          route: "company",
          params: { company: companyName },
        })
      );
  };

export const company = companyRouteFactory(postService);
export const Romaguera = companyRouteFactory(postService, () => ({
  companyName: "Romaguera",
}));
