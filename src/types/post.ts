/**
 * The Post type defines the structure of the post object fetched from an external API.
 * @see https://jsonplaceholder.typicode.com/posts
 */
export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
