import { ApiRepository } from "../data";

/**
 * A function that facilitates querying 1:N relationships between data entities,
 * where a parent entity P contains child entities C.
 * This relation helps to abstract the logic for querying related entities
 * and can be easily adapted for different parent-child relationships.
 *
 * The function accepts a predicate for filtering parent entities,
 * and then fetches the corresponding child entities based on the matching parent IDs.
 */
export type ContainsRelation<P, C> = (
  predicate: (parent: P) => boolean
) => Promise<C[]>;

/**
 * A higher-order function for querying 1:N relationships between data entities,
 * where a parent entity contains child entities, based on a given predicate.
 *
 * @template P Parent data entity type with an 'id' property
 * @template C Child data entity type
 * @param parentRepo A repository instance for loading parent data entities
 * @param childRepo A repository instance for loading child data entities
 * @param foreignKey A property name in the child data entity representing the foreign key to the parent
 * @returns A function that accepts a predicate and returns a promise resolving to an array of child data entities
 *
 * @example
 * const companyPosts = containsRelation(userRepo, postRepo, 'userId');
 * const result = await companyPosts(user => user.company?.name?.includes(companyName));
 */
export const containsRelation =
  <P extends { id: unknown }, C>(
    parentRepo: ApiRepository<P>,
    childRepo: ApiRepository<C>,
    foreignKey: keyof C
  ): ContainsRelation<P, C> =>
  async (
    // The predicate function for filtering parent entities
    predicate: (parent: P) => boolean
  ): Promise<C[]> => {
    const [parentData, childData] = await Promise.all([
      parentRepo.load(),
      childRepo.load(),
    ]);

    // Get all user IDs that match the filter
    const parentIds = parentData.filter(predicate).map((parent) => parent.id);

    // If no users are found, return empty array
    if (parentIds.length === 0) {
      return [];
    }

    // For each user, get the posts they have written
    return childData.filter((child) => parentIds.includes(child[foreignKey]));
  };
