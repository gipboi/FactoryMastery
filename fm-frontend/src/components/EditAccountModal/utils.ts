import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import { IUserWithRelations } from "interfaces/user";
import { IOption } from "types/common";
import { getFullName } from "utils/user";
import {
  getRoleName,
  roleOptions,
} from "./components/RoleSelectionSection/constants";

export type IGroupOption = IOption<string> & {
  admin?: boolean;
  permission?: GroupMemberPermissionEnum;
};
export function getDefaultValues(
  userDetail: IUserWithRelations,
  groupOptions: IGroupOption[]
) {
  const authRole: AuthRoleNameEnum =
    (userDetail?.authRole as AuthRoleNameEnum) ?? AuthRoleNameEnum.BASIC_USER;
  const groupPermissions = Array.isArray(userDetail?.groupMembers)
    ? (userDetail.groupMembers
        .map((groupMember) => {
          const foundOption = groupOptions.find(
            (option) => option.value === String(groupMember.groupId)
          );
          return foundOption
            ? {
                ...foundOption,
                admin: groupMember.admin,
                permission: groupMember?.permission,
              }
            : null;
        })
        .filter(Boolean) as (IOption<string> & { admin: boolean })[])
    : [];
  return {
    fullName: getFullName(userDetail?.firstName, userDetail.lastName) ?? "",
    username: userDetail?.username ?? "",
    email: userDetail?.email ?? "",
    authRole: roleOptions,
    image: userDetail?.image ?? "",
    role: getRoleName(authRole as unknown as AuthRoleIdEnum),
    groupPermissions,
  };
}
