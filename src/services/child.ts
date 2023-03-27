import { Data, ApiRepository } from "../data";

export interface ChildService<P, C> {
  filterByParent(predicate: (parent: P) => boolean): Promise<C[]>;
}

export class ChildDataService<ParentData extends Data, ChildData extends Data>
  implements ChildService<ParentData, ChildData>
{
  constructor(
    private readonly parentRepo: ApiRepository<ParentData>,
    private readonly childRepo: ApiRepository<ChildData>,
    private readonly foreignKey: keyof ChildData
  ) {}

  // predicate: user => user.company?.name?.includes(companyName)
  async filterByParent(
    predicate: (parent: ParentData) => boolean
  ): Promise<ChildData[]> {
    const [parentData, childData] = await Promise.all([
      this.parentRepo.load(),
      this.childRepo.load(),
    ]);
    // Get all users that match the filter
    const parents = parentData.filter(predicate);

    // If no users are found, return empty array
    if (parents.length === 0) {
      return [];
    }

    // For each user, get the posts they have written
    const parentIds = parents.map((user) => user.id);
    const children = childData.filter((post) =>
      parentIds.includes(post[this.foreignKey] as number)
    );

    return children;
  }
}
