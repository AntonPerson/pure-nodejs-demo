import { postService, ChildService } from "../services";
import { ApiRequest, ApiResponse, Post, User } from "../types";
import { ValidationError, handleExternalError } from "../utils";

export function validateCompanyParameters(req?: ApiRequest) {
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
  postService: ChildService<User, Post>,
  paramValidator: (req?: ApiRequest<CompanyQuery>) => {
    companyName: string;
  } = validateCompanyParameters
) =>
  function companyRoute(req?: ApiRequest<CompanyQuery>): Promise<ApiResponse> {
    const { companyName } = paramValidator(req);

    return postService
      .filterByParent((user) => user.company?.name?.includes(companyName))
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
