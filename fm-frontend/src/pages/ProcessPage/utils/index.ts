// import { IAsyncSelectOption } from "interfaces/common";
// import { IProcessesFilterForm } from "interfaces/process";
// import { IUser } from "interfaces/user";
// import { getFullName } from "utils/users";

import { GroupMemberPermissionEnum } from "constants/enums/group";
import { IGroupMember } from "interfaces/groups";
import {
  IProcessesFilterForm,
  IProcessWithRelations,
} from "interfaces/process";
import { checkValidArray, getValidArray } from "utils/common";

// export * from "../media";

// export function getUserOptions(users: IUser[]): IAsyncSelectOption<number>[] {
//   return getValidArray(users).map((user) => ({
//     label: getFullName(user?.firstName, user?.lastName),
//     value: user.id,
//     image: user?.image ?? user.id,
//   }));
// }

export function mapSortTitleToValue(sortTitle: string): string {
  switch (sortTitle) {
    case "Last updated":
      return "updatedAt";
    case "Newest":
      return "createdAt";
    case "Name (A-Z)":
      return "name";
    default:
      return "updatedAt";
  }
}

export function checkValidFilter(searchFilter: IProcessesFilterForm): boolean {
  const { collections, tags, documentTypes, groups } = searchFilter;
  return (
    checkValidArray(groups) ||
    checkValidArray(tags) ||
    checkValidArray(collections) ||
    checkValidArray(documentTypes)
  );
}

export function countFilter(searchFilter: IProcessesFilterForm): number {
  const { collections, tags, documentTypes, groups } = searchFilter;
  return [collections, tags, documentTypes, groups].filter((filter) =>
    checkValidArray(filter)
  ).length;
}

export function checkUserCanEditProcess(
  userId: string,
  groupMembers: IGroupMember[],
  process: IProcessWithRelations
): boolean {
  const groupProcessIds: string[] = getValidArray(process?.groups).map(
    (group) => group?._id ?? group?.id ?? ""
  );

  const matchGroupMember: IGroupMember[] = getValidArray(groupMembers).filter(
    (groupMember) => groupProcessIds.includes(groupMember?.groupId ?? "")
  );
  const hasEditorPermission: boolean = matchGroupMember.some(
    (groupMember) =>
      groupMember?.userId === userId &&
      groupMember?.permission === GroupMemberPermissionEnum.EDITOR
  );

  return hasEditorPermission;
}
