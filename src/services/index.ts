import { PostRepository, UserRepository } from "../data";
import { Post, User } from "../types";
import { ChildDataService } from "./post";

const userRepo = new UserRepository();
const postRepo = new PostRepository();

export const postService = new ChildDataService<User, Post>(
  userRepo,
  postRepo,
  "userId"
);
