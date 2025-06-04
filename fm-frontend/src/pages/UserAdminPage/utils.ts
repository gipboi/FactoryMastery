import dayjs from "dayjs";
import { AuthRoleNameEnum } from "constants/user";
import { IUserWithRelations } from "interfaces/user";
import { getValidArray } from "utils/common";
import { getFullName } from "utils/user";

function getUserType(authRole: string) {
  if (authRole === AuthRoleNameEnum.ORG_ADMIN) {
    return AuthRoleNameEnum.ORG_ADMIN;
  }
  if (authRole === AuthRoleNameEnum.MANAGER) {
    return AuthRoleNameEnum.MANAGER;
  }
  if (authRole === AuthRoleNameEnum.BASIC_USER) {
    return AuthRoleNameEnum.BASIC_USER;
  }
  return "";
}

export function exportUsersData(users: IUserWithRelations[]) {
  return getValidArray(users).map((user: IUserWithRelations) => {
    const {
      firstName,
      lastName,
      email,
      authRole,
      disabled,
      lastSignInAt,
      createdAt,
    } = user;

    const groups: string = getValidArray(user?.groups)
      .map((group) => group?.name ?? "")
      .join(", ");
    return {
      "User type": getUserType(authRole ?? ""),
      "Full name": getFullName(firstName, lastName),
      Email: email ?? "",
      Groups: groups ?? "",
      Status: disabled ? "Disabled" : "Active",
      "Last login date": lastSignInAt
        ? dayjs(lastSignInAt).format("MM/DD/YYYY")
        : "",
      "Creation date": createdAt ? dayjs(createdAt).format("MM/DD/YYYY") : "",
    };
  });
}
