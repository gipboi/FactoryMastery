import { IUserWithRelations } from "interfaces/user";
import { getValidArray } from "utils/common";
import { IGroupMember } from "interfaces/groups";
import { IGroupDetail } from "../AssignUserModal/contants";

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

export function getDefaultGroupDetails(
  users: IUserWithRelations[],
  selectedIndexes: number[]
): IGroupDetail[] {
  let groupDetails: Set<IGroupDetail> = new Set<IGroupDetail>();
  getValidArray(users)
    .filter((user: IUserWithRelations, index) => selectedIndexes[index])
    .forEach((user: IUserWithRelations) => {
      if (user.groupMembers) {
        user.groupMembers.forEach((member: IGroupMember) =>
          groupDetails.add({
            groupId: member.groupId!,
            permission: member.permission!,
          })
        );
      }
    });

  return Array.from(groupDetails);
}

export enum ETableHeader {
  CHECKBOX = "checkbox",
  ICON = "icon",
  NAME = "name",
  EMAIL = "email",
  TYPE = "type",
  LAST_LOGIN = "lastLogin",
  ACTIONS = "actions",
}
