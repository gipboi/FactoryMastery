import { MemberTypeEnum } from "constants/enums/user";
import { ICollection } from "interfaces/collection";
import { IGroup, IGroupMember, IGroupOption } from "interfaces/groups";
import { IOrganization } from "interfaces/organization";
import { IProcessWithRelations } from "interfaces/process";
import { IOption } from "types/common";

export interface IUser {
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
  authRole?: string;
  encryptedPassword?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  mobilePhone?: string;
  workPhone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  image?: string;
  tokens?: string;
  admin?: boolean;
  owner?: boolean;
  superAdmin?: boolean;
  manager?: boolean;
  disabled?: boolean;
  isResetPassword?: boolean;
  resetPasswordToken?: string;
  resetPasswordSentAt?: string;
  signInCount?: Number;
  currentSignInAt?: Date;
  lastSignInAt?: Date;
  currentSignInIp?: string;
  lastSignInIp?: string;
  organizationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isEditor?: boolean;
  isReportTool?: boolean;
  isMessageFullAccess?: boolean;
  permissionUpdatedAt?: Date;
  oldPassword?: string;
  newPassword?: string;
  isAutoClaimThread?: boolean;
}

export interface ICreateEditUserRequest
  extends Pick<
    IUser,
    "username" | "email" | "authRole" | "firstName" | "lastName"
  > {
  groups?: IGroupMember[];
  password?: string;
  organizationId?: string;
}

export interface IUserWithRelations extends IUser {
  groupMembers?: IGroupMember[];
  groups?: IGroup[];
  userCollections?: IUserCollection[];
  userProcesses?: IUserProcess[];
  organization?: IOrganization;
}

export interface IUserCollection {
  id: string;
  userId: string;
  collectionId: string;
  collection: ICollection;
  // collection: any;
}

export interface IUserProcess {
  id: string;
  userId: string;
  processId: string;
  process: IProcessWithRelations;
  isDirectlyShared: boolean;
  user: IUser;
}

export interface IUserDetailForm {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  userType: string;
  password: string;
  groupPermissions: IGroupOption[];
  organizations?: IOption<string>[];
}

export interface IUsersFilterForm {
  userTypes: string[];
  groups: IOption<string>[];
  sortBy?: string;
  users?: IOption<string>[];
  organizations?: IOption<string>[];
}

export interface INotificationUsersFilterForm {
  sortBy?: string;
  users: IOption<string>[];
}

export interface IMemberItem {
  admin: boolean;
  userId: string;
  memberType: MemberTypeEnum;
}

export enum EAuditableType {
  MEDIUM = "Medium",
  COLLECTION = "Collection",
  TEXT_CONTENT = "TextContent",
  STANDARD_OPERATING_PROCEDURE = "StandardOperatingProcedure",
  STEP = "Step",
}

export interface IAuditWithRelations {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  auditableId: string;
  auditableType: EAuditableType;
  associatedId: string;
  associatedType: string;
  userId: string;
  userType: string;
  username: string;
  action: EAuditAction;
  auditedChanges: string;
  version: number;
  comment: string;
  remoteAddress: string;
  requestUuid: string;
  process?: IProcessWithRelations;
  collection?: ICollection;
}

export enum EAuditAction {
  LOGIN = "login",
  CREATE = "create",
  UPDATE = "update",
  DESTROY = "destroy",
  VIEW = "view",
  NOTE = "note",
  COMMENT = "comment",
}

export interface IUpdateUserPermission {
  isReportTool: boolean;
  isMessageFullAccess: boolean;
}

export interface IEditEditUserRequest
  extends Pick<
    IUser,
    | "organizationId"
    | "username"
    | "email"
    | "authRole"
    | "firstName"
    | "lastName"
    | "image"
    | "disabled"
    | "isAutoClaimThread"
  > {
  groups?: IGroupMember[];
  oldPassword?: string;
  newPassword?: string;
}
