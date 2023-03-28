import { ApiRepository } from "../data";

export type ContainsRelation<P, C> = (
  predicate: (parent: P) => boolean
) => Promise<C[]>;

export const containsRelation =
  <P extends { id: unknown }, C>(
    parentRepo: ApiRepository<P>,
    childRepo: ApiRepository<C>,
    foreignKey: keyof C
  ): ContainsRelation<P, C> =>
  async (
    // Example: user => user.company?.name?.includes(companyName)
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
