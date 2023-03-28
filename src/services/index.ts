import { PostRepository, UserRepository } from "../data";
import { createUserService } from "./user";

const userRepo = new UserRepository();
const postRepo = new PostRepository();

export const userService = createUserService(userRepo, postRepo);

export * from "./contains";
export * from "./user";
