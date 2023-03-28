import { ApiRepository } from "../data";
import { Post, User } from "../types";
import { ContainsRelation, containsRelation } from "./contains";

export interface UserService {
  filterPosts: ContainsRelation<User, Post>;
}

export function createUserService(
  userRepo: ApiRepository<User>,
  postRepo: ApiRepository<Post>
): UserService {
  return {
    filterPosts: containsRelation(userRepo, postRepo, "userId"),
  };
}
