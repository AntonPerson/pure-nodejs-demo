import { ApiRepository } from "../data";
import { Post, User } from "../types";
import { ContainsRelation, containsRelation } from "./contains";

/**
 * A service for user related business logic.
 */
export interface UserService {
  filterPosts: ContainsRelation<User, Post>;
}

/**
 * A factory function for creating a UserService instance.
 * This encapsulates the business logic for User related operations.
 *
 * @param userRepo A repository instance for loading `User` data entities
 * @param postRepo A repository instance for loading `Post` data entities
 * @returns A `UserService` instance for user related business logic
 * @example
 * const userService = createUserService(userRepo, postRepo);
 * const result = await userService.filterPosts(user => user.company?.name?.includes(companyName));
 * @see {@link UserService}
 * @see {@link ApiRepository}
 * @see {@link User}
 * @see {@link Post}
 */
export function createUserService(
  userRepo: ApiRepository<User>,
  postRepo: ApiRepository<Post>
): UserService {
  return {
    filterPosts: containsRelation(userRepo, postRepo, "userId"),
  };
}
