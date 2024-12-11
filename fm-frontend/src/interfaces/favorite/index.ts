import { ICollection } from "interfaces/collection";
import { IProcessWithRelations } from "interfaces/process";

export interface IFavorite {
  id?: string;
  userId?: string;
  processId?: string;
  collectionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFavoriteWithRelations extends IFavorite {
  process?: IProcessWithRelations;
  collection?: ICollection;
}
