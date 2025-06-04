import { IUser } from "interfaces/user";

export interface IProcessRating {
  id?: string;
  processId: string;
  userId: string;
  userName: string;
  rating: number; 
  review?: string; 
  createdAt: Date;
  updatedAt?: Date;
  user?: IUser;
}
