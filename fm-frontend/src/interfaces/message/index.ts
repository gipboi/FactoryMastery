import { IProcessWithRelations } from "interfaces/process";
import { IStepWithRelations } from "interfaces/step";
import { IUser } from "../user";
import { EMediaThumbnail } from "constants/media";
import { OptionType } from "pages/SupportInboxPage/constants";

export interface IMessageGroup {
  thread: IMessageGroupThreads;
  groups: {
    name: string;
  }[];
  users?: IUser[];
  isSeen: boolean;
  organizationId?: string;
  sentDate?: any;
  name?: string;
}

export interface IMessageGroupThreads {
  id: string;
  name?: string;
  lastMessageAt: Date;
  organizationId: string;
  groups: {
    name: string;
  }[];
  users?: IUser[];
  groupMessages: IGroupMessages[];
  groupMessageThreadUserSeens: IGroupMessageThreadUserSeen[];
  isSeen: boolean;
  createdAt: Date;
  isGroup?: boolean;
}

export interface IGroupMessages {
  createdAt: Date;
  updatedAt: Date;
  id: string;
  content: string;
  attachments?: IAttachment[];
  groupThreadId: string;
  userId: string;
  user: IUser;
  receiverId: string;
  receiver: IUser;
  isSeen?: boolean;
  seenBy?: string[]
}

export interface IThreadGroup {
  id?: string
  name?: string;
  organizationId: string;
  userId?: string;
  isPrivate?: boolean;

  groupMessages?: IGroupMessages[]
}

export interface ISelectMember {
  members: IThreadMember[];
}

export interface IThreadMember {
  label?: string;
  value: number;
  type?: OptionType;
}

export interface ISupportMessage {
  id: string;
  attachments?: IAttachment[];
  content?: string;
  userId: string;
  supportThreadId: string;
  createdAt: Date;
  user: IUser;
}

export interface ISupportThreadDto {
  isSeen: boolean;
  thread: ISupportMessageThread;
}

export interface ISupportMessageThread {
  id: string;
  name?: string;
  subject?: string;
  lastMessageAt: Date;
  status: SupportMessageThreadStatus;
  step?: IStepWithRelations;
  process?: IProcessWithRelations;
  organizationId: string;
  supportMessages: ISupportMessage[];
  users?: IUser[];
  stepId?: string;
  processId?: string;
  claimedBy?: string;
  createdAt: Date;
  supportMessage: ISupportMessage;
}

export enum SupportMessageThreadStatus {
  ALL = 0,
  UNCLAIMED = 1,
  CLAIMED = 2,
  RESOLVED = 3,
  UNREAD = 4,
}

export interface ICreateSupportMessageThread {
  stepId?: string;
  processId?: string;
  organizationId: string;
  userId: string;
  content: string;
  subject?: string;
  attachments?: { name: string; type: string }[];
}

export interface ISupportMessageThreadStatusHistory {
  id: string;
  userId: string;
  threadId: string;
  status: SupportMessageThreadStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
}

export interface IGroupMessageThreadUserSeen {
  userId: string;
  groupThreadId: string;
  lastSeenAt: Date;
}

export interface IMessageAttachment {
  name: string;
  type: string;
  url: string;
}

export interface IAttachment {
  url: string;
  name: string;
  type: EMediaThumbnail;
}