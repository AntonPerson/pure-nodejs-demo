import { expect, it, describe } from "vitest";
import { companyRouteFactory, companyNameInputValidator } from "./company";
import { UserRepository } from "../data/user.mock";
import { PostRepository } from "../data/post.mock";
import { createUserService } from "../services";

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
    ({
      type: "FILTER",
      data: [
        {
          userId: 1,
          id: 8,
          title: "dolorem dolore est ipsam",
          body: "dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae",
        },
        {
          userId: 1,
          id: 9,
          title: "nesciunt iure omnis dolorem tempora et accusantium",
          body: "consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas",
        },
      ],
    });
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
