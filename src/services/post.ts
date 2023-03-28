import { ApiRepository } from "../data";
import { Post, User } from "../types";
import { ContainsRelation } from "./contains";

export class PostService extends ContainsRelation<User, Post> {
  constructor(userRepo: ApiRepository<User>, postRepo: ApiRepository<Post>) {
    super(userRepo, postRepo, "userId");
  }
}
