import { PostRepository, UserRepository } from "../data";
import { createUserService } from "./user";

const userRepo = new UserRepository();
const postRepo = new PostRepository();

// TODO: This is a temporary solution, we should create a DI container
export const userService = createUserService(userRepo, postRepo);

export * from "./contains";
export * from "./user";
