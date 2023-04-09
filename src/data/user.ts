import { User } from "../types";
import { fetchData } from "../utils";
import { ApiRepository, DataRepository, Repository } from "./repository";

export interface UserDataRepository extends Repository<User> {
  type: "User";
}

export type UserApiRepository = UserRepository & ApiRepository<User>;

export class UserRepository
  extends DataRepository<User>
  implements UserApiRepository
{
  public type = "User" as const;

  async load(): Promise<UserRepository> {
    this.data = await fetchData<User[]>(
      process.env.URL_USERS || "https://jsonplaceholder.typicode.com/users"
    );
    return this;
  }
}
