import { ApiRepository } from "../data";
import { Post, User } from "../types";
import { ChildDataService } from "./child";

export class PostService extends ChildDataService<User, Post> {
  constructor(userRepo: ApiRepository<User>, postRepo: ApiRepository<Post>) {
    super(userRepo, postRepo, "userId");
  }
}
