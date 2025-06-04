import { ProcessType } from "config/constant/enums/process";
import { AuthRoleIdEnum } from "constants/user";
import { ICollection } from "interfaces/collection";
import { IAsyncSelectOption } from "interfaces/common";
import { IDocumentType } from "interfaces/documentType";
import { IGroupDetail, IGroupMember } from "interfaces/groups";
import { IIconBuilder } from "interfaces/iconBuilder";
import { IStepWithRelations } from "interfaces/step";
import { ITag } from "interfaces/tag";
import { IUser, IUserProcess } from "interfaces/user";

export interface IProcess {
  _id?: string;
  id: string;
  name?: string;
  parentWorkflowId?: string;
  processId?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  description?: string;
  dateStarted?: Date;
  dateCompleted?: Date;
  image?: string;
  version?: string;
  owner?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  totalTime?: string;
  organizationId?: string;
  collectionId?: string;
  public?: boolean;
  status?: number;
  reason?: string;
  primaryGroupId?: string;
  processWorkflowId?: string;
  processWorkflowStepId?: string;
  documentTypeId?: string;
  checkedOut?: boolean;
  checkedOutById?: string;
  checkedOutDate?: Date;
  dateSubmitted?: Date;
  reviewerId?: string;
  reviewStarted?: Date;
  reviewComplete?: Date;
  previousStatus?: string;
  publishedDate?: Date;
  rejectedDate?: Date;
  rejectedById?: string;
  isPublished?: boolean;
  publishedById?: string;
  procedureIcon?: { type: ProcessType; color: string };
  procedureIconType?: ProcessType;
  procedureIconColor?: string;
  releaseNote?: string;
  editorNote?: string;
  originalProcessId?: string;
  collaborators?: IUser[];
  archivedAt?: Date;
  tagIds?: string[];
}

export interface IProcessWithRelations extends IProcess {
  steps?: IStepWithRelations[];
  collections: ICollection[];
  collection?: ICollection;
  documentType?: IDocumentType;
  groups?: IGroupDetail[];
  tags?: ITag[];
  collaborators?: IUser[];
  iconBuilder?: IIconBuilder;
  creatorName?: string;
  creatorImage?: string;
  creator?: IUser;
  userProcesses?: IUserProcess[];

  // INFO additional field when aggregate only
  currentMemberPermissions?: IGroupMember[];
}

export interface IProcessesFilter {
  collections: number[];
  documentTypes: number[];
  groups: number[];
  sort: string;
  tags: number[];
}

export interface IProcessesFilterForm {
  collections: IAsyncSelectOption<string>[];
  creators: IAsyncSelectOption<string>[];
  documentTypes: IAsyncSelectOption<string>[];
  groups: IAsyncSelectOption<string>[];
  sort: string;
  tags?: IAsyncSelectOption<string>[];
}

export interface IGroupProcess {
  groupId: string;
  processId: string;
}

export interface IReportProcessTable {
  id: string;
  process: string;
  creatorName: string;
  view: number;
  edit: number;
  comment: number;
  note: number;
  "Document Type Name"?: string;
  Tags?: string;
  "Created Date"?: Date;
  "Last Modified Date"?: Date;
  "Current Status"?: string;
  "Created By"?: string;
  "Published Date"?: Date;
}

export interface IProcessFilter {
  organizationId: string;
  limit: number;
  skip: number;
  directProcessIds: string[];
  collectionIds: string[];
  creatorIds: string[];
  documentTypeIds: string[];
  groupIds: string[];
  tagIds: string[];
  sortField: string;
  isCounting: boolean;
  isPublished: boolean;
  userId: string | undefined;
  userRoleId: AuthRoleIdEnum;
  isArchived?: boolean;
  keyword?: string;
  onlyGetProcessThatUserHaveEditPermission?: boolean;
}

export interface IProcessDuplicate {
  documentTypeId: string;
  // copyCollection?: boolean;
  copySharing?: boolean;
  copyTags?: boolean;
  copyNote?: boolean;
  name: string;
}
