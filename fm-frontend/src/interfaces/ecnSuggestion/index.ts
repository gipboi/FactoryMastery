import { IEcnSuggestionAttachment } from "interfaces/ecnSuggestionAttachment";
import { IUser } from "interfaces/user";

export interface IEcnSuggestion {
  id: number;
  stepId?: number;
  userId?: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isAdminOnly?: boolean;
}

export interface IEcnSuggestionWithRelations extends IEcnSuggestion {
  user: IUser;
  ecnSuggestionAttachments: IEcnSuggestionAttachment[];
}
