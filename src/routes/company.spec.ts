import { expect, it, describe } from "vitest";
import { companyRouteFactory, companyNameInputValidator } from "./company";
import { UserRepository } from "../data/user.mock";
import { PostRepository } from "../data/post.mock";
import { createUserService } from "../services";
import { Post } from "../types";

describe("company", () => {
  const mockUserService = createUserService(
    new UserRepository(),
    new PostRepository()
  );
  const companyRoute = companyRouteFactory(
    mockUserService,
    companyNameInputValidator
  );

  it("should throw an error when no company is provided", () => {
    expect(() => companyRoute()).toThrowError("Invalid input parameters.");
  });

  it("should throw an error when an invalid company is provided", () => {
    expect(() =>
      companyRoute({ query: { companyName: 123 as unknown as string } })
    ).toThrowError("Invalid input parameters.");
  });

  it("should return a list of posts when a valid company is provided", async () => {
    const result = await companyRoute({
      query: { companyName: "Romaguera" },
    });
    expect(result.body?.data?.length).toBeGreaterThan(0);
    // User with company name "Romaguera" has id 1
    expect(
      result.body?.data?.find((post: Post) => post.userId !== 1)
    ).toBeFalsy();
  });

  it("should return an empty list of posts when the company can not be found", async () => {
    const result = await companyRoute({
      query: { companyName: "Not a company" },
    });
    expect(result.body).toEqual({
      type: "FILTER",
      data: [],
    });
  });
});
