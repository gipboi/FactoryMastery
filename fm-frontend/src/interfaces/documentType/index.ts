import { IIconBuilder } from "interfaces/iconBuilder";
import { IUser } from "interfaces/user";

export interface IDocumentType {
  id?: string;
  _id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  description?: string;
  organizationId?: string;
  icon?: { type: number; color: string };
  iconBuilder?: IIconBuilder;
  creator?: IUser;
  createdBy?: number;
  iconId?: string;
  isDeleted?: boolean;
  views?: number;
}
