/**
 * The Image type defines the structure of the image object fetched from an external API.
 * @see https://jsonplaceholder.typicode.com/photos
 */
export type Image = {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};
