import { PostRepository, UserRepository } from "../data";
import { PostService } from "./post";

const userRepo = new UserRepository();
const postRepo = new PostRepository();

export const postService = new PostService(userRepo, postRepo);

export * from "./child";
export * from "./post";
