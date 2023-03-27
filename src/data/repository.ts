export interface Repository<T> {
  getAll(): T[];
  getById(id: number): T | null;
  filter(predicate: (item: T) => boolean): T[];
}

export interface ApiRepository<T> {
  load(): Promise<Repository<T>>;
}

export interface Data {
  id: number;
}

export class DataRepository<T extends Data> implements Repository<T> {
  protected data: T[] = [];

  getAll(): T[] {
    return this.data;
  }

  getById(id: number): T | null {
    return this.data.find((item) => item.id === id) || null;
  }

  filter(predicate: (post: T) => boolean): T[] {
    return this.data.filter(predicate);
  }
}
