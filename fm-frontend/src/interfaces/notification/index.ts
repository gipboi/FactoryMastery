import { NotificationTypeEnum } from "config/constant/enums/notification";
import { IProcess } from "interfaces/process";
import { IStep } from "interfaces/step";
import { IUser } from "interfaces/user";
import { IEcnSuggestion } from "../ecnSuggestion";

export interface INotification {
  id?: string;
  title?: string;
  reason?: string;
  type?: NotificationTypeEnum;
  createdAt?: Date;
  updatedAt?: Date;
  reviewer?: string;
  processWorkflowId?: string;
  subType?: number;
  rejectionReason?: string;
  admins?: string;
  description?: string;
  comment?: string;
  userId: string;
  authorId: string;
  processId: string;
  stepId: string;
  ecnSuggestionId: string;
  isSeen?: boolean;
  deletedName?: string;
  keyword?: string;
  messageThreadId?: string;
}

export interface INotificationRelations {
  user?: IUser;
  author?: IUser;
  process?: IProcess;
  step?: IStep;
  ecnSuggestion?: IEcnSuggestion;
}

export type INotificationWithRelations = INotification & INotificationRelations;
