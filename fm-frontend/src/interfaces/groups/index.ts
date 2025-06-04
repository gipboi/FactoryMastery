import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";
import { ICollectionProcess, ICollectionsGroup } from "interfaces/collection";
import { IUser } from "interfaces/user";
import { IOption } from "types/common";

export interface IGroup {
  id?: string;
  _id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  description?: string;
  isCompanyGroup?: boolean;
  archived?: boolean;
  isDeleted?: boolean;
  organizationId: string;

  numberOfMembers?: number;
  numberOfCollections?: number;
  groupMembers?: IGroupMember[];
}

export interface IGroupDetail extends IGroup {
  members: IGroupMember[];
  numberOfMembers?: number;
  collectionProcesses?: ICollectionProcess[];
  collectionGroups?: ICollectionsGroup[];
}

export interface IGroupMember {
  id?: string;
  _id?: string;
  userId?: string;
  groupId: string;
  permission?: GroupMemberPermissionEnum;
  memberType?: string;
  admin?: boolean;
  group?: IGroup | IGroup[];
  member?: IUser;
}

export interface IDuplicateGroupDTO {
  name: string;
  description?: string;
  isDuplicateMember?: boolean;
  isDuplicateProcessAndCollection?: boolean;
}

export type IGroupOption = {
  admin?: boolean;
  groupId: string;
  permission?: GroupMemberPermissionEnum;
};

export interface IUpdateGroupMember {
  userIds: string[];
  toRemoveGroupIds: string[];
  toCreateGroupMembers: IGroupMember[];
}

export type IUserInGroup = Pick<
  IUser,
  | "id"
  | "firstName"
  | "lastName"
  | "lastSignInAt"
  | "email"
  | "organizationId"
  | "disabled"
  | "username"
  | "image"
>;

export interface IGroupMemberDetail extends IUserInGroup {
  permission: GroupMemberPermissionEnum;
  groupId: string;
  groupMemberId: string;
  group?: IGroup;
  member?: IUser;
}

export interface IGroupsFilterForm {
  sortBy?: string;
  users: IOption<string>[];
  collections: IOption<string>[];
}

export interface IAggregateGroupMemberResult {
  paginatedResults: IGroupMemberDetail[];
  totalCount: number | {
    total: number;
  };
}
