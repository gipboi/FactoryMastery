import { countUsers, getUsers } from "API/user";
import { IBaseResponse } from "interfaces";
import { IResponse } from "interfaces/common";
import { IUser } from "interfaces/user";
import { IFilter, Where } from "types/common";
import { getSearchUserWhereQuery } from "utils/user";

export async function loadUserOptions(
  searchText: string,
  organizationId: string,
  loadedOptions: any
): Promise<IResponse> {
  const whereQuery = getSearchUserWhereQuery(searchText);
  whereQuery.organizationId = organizationId;
  // whereQuery.isInactive = false;
  const query = {
    where: whereQuery,
    fields: ["firstName", "lastName", "id", "username", "email"],
    limit: 20,
    offset: loadedOptions?.length ?? 0,
  };
  const totalUsers = await countUsers(query?.where as Where<IUser>);
  // const users = await getUsers(query as IFilter<IUser>);
  const users: IUser[] = await getUsers(
    query as IFilter<IUser>
  );

  return {
    options: users.map((user: IUser) => ({
      label: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
      value: user.id,
    })),
    hasMore: loadedOptions.length < totalUsers,
  };
}
