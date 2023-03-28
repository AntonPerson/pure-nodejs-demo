import { userService, ContainsRelation, UserService } from "../services";
import { ApiBody, ApiRequest, ApiResponse, Post, User } from "../types";
import { ValidationError, handleError } from "../utils";

/**
 * Validates the input and returns the company name.
 * @param req API request
 * @returns Company route parameters:
 *  - company name
 */
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

/**
 * A factory function for creating a company route.
 * @param userService service instance for user related business logic
 * @param inputValidator function that validates the input and returns the company name
 * @returns API route function
 */
export const companyRouteFactory = (
  userService: UserService,
  inputValidator: (req?: ApiRequest<CompanyQuery>) => {
    companyName: string;
  } = companyNameInputValidator
) =>
  function companyRoute(
    req?: ApiRequest<CompanyQuery>
  ): Promise<ApiResponse<ApiBody<Post[]>>> {
    const { companyName } = inputValidator(req);

    return userService
      .filterPosts((user) => user.company?.name?.includes(companyName))
      .then((data) => ({
        body: {
          type: "FILTER",
          data,
        },
      }))
      .catch(
        handleError({
          route: "company",
          params: { company: companyName },
        })
      );
  };

export const company = companyRouteFactory(userService);
export const Romaguera = companyRouteFactory(userService, () => ({
  companyName: "Romaguera",
}));
