import { IGroup } from 'interfaces/groups';
import { IProcessWithRelations } from 'interfaces/process';
import { IUserCollection } from 'interfaces/user';

export interface ICollection {
  _id?: string;
  id?: string;
  name?: string;
  organizationId?: string;
  mainMedia?: string;
  overview?: string;
  public?: boolean;
  archived?: boolean;
  isVisible?: boolean;
  archivedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  publishedDate?: Date | null;
  groups: IGroup[];
  collectionsProcesses: ICollectionsProcess[];
  collectionGroups?: ICollectionsGroup[];
  userCollections?: IUserCollection[];
  isPublished: boolean;
}

export interface ICreateEditCollectionRequest
  extends Pick<ICollection, 'name' | 'overview'> {
  groupIds?: string[];
  processIds?: string[];
}

export interface ICollectionsProcess {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  position?: number;
  collectionId?: string;
  processId?: string;
  process: IProcessWithRelations;
}

export interface ICollectionsGroup {
  id?: string;
  collectionId?: string;
  groupId?: string;
  group?: IGroup;
  collection?: ICollection;
}

export interface ICollectionDetailForm {
  id?: string;
  name?: string;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  mainMedia?: string;
  overview?: string;
  public?: boolean;
  archived?: boolean;
  organizationId?: string;
  processIds?: string[];
  groupIds?: string[];
  userIds?: string[];
  isVisible?: boolean;
  isPublished?: boolean;
}

export interface ICollectionProcessesForm {
  position?: number;
  collectionId?: string;
  processId?: string;
}

export interface ICollectionProcess {
  collectionId?: string;
  processId?: string;
  position?: number | null;
}

export interface ICreateCollectionProcessBatchDto {
  collectionIds: string[];
  processId: string;
}

export interface ICollectionFilter {
  name?: string;
  userId?: string;
  organizationId?: string;
  sortBy?: string;
  groupIds?: string[];
  processIds?: string[];
  documentTypeIds?: string[];
  tagIds?: string[];
  creatorIds?: string[];
  modifiedDate?: string[];
  public?: boolean;
  isVisible?: boolean;
  skip?: number;
  limit?: number;
}

export interface IReportCollectionTable {
  id?: string;
  collection: string;
  number_of_process: number;
  view: number;
  edit: number;
  comment: number;
  note: number;
}
