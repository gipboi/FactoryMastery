import { IUser } from "interfaces/user";
export interface ITag {
  id?: string;
  _id?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: string;
  createdBy?: number;
  updatedBy?: number;
  creator?: IUser;
}
