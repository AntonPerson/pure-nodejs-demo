import type { Post } from "../types";
import { ApiRepository, DataRepository, Repository } from "./repository";
import { fetchData } from "../utils";

export interface PostDataRepository extends Repository<Post> {
  type: "Post";
}

export type PostApiRepository = PostRepository & ApiRepository<Post>;

export class PostRepository
  extends DataRepository<Post>
  implements PostApiRepository
{
  public type = "Post" as const;

  async load(): Promise<PostRepository> {
    this.data = await fetchData<Post[]>(
      process.env.URL_POSTS || "https://jsonplaceholder.typicode.com/posts"
    );
    return this;
  }
}
