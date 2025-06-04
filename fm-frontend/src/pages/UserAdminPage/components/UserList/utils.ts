import { IUserWithRelations } from "interfaces/user";
import { getValidArray } from "utils/common";
import { IGroupMember } from "interfaces/groups";

export function getDefaultGroupIds(
  users: IUserWithRelations[],
  selectedIndexes: number[]
): string[] {
  let groupIds: Set<string> = new Set<string>();
  getValidArray(users)
    .filter((user: IUserWithRelations, index) => selectedIndexes[index])
    .forEach((user: IUserWithRelations) => {
      if (user.groupMembers) {
        user.groupMembers.forEach((member: IGroupMember) =>
          groupIds.add(member.groupId!)
        );
      }
    });

  return Array.from(groupIds);
}

export enum ETableHeader {
  CHECKBOX = "checkbox",
  ICON = "icon",
  NAME = "name",
  EMAIL = "email",
  TYPE = "type",
  LAST_LOGIN = "lastLogin",
  ACTIONS = "actions",
  ORGANIZATION = 'organizations'
}
