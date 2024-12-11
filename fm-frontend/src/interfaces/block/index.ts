import { IDecisionPointWithRelations } from "interfaces/decisionPoint";
import { IIconBuilder } from "interfaces/iconBuilder";
import { IMedia } from "interfaces/media";

export interface IBlock {
  _id?: string;
  content: string;
  createdAt: string;
  iconName: string;
  iconId?: string;
  id: string;
  mediaId?: string;
  mediaTitle?: string;
  position: number;
  stepId: string;
  type: string;
  updatedAt: string;
  isDisableMediaLabel: boolean;
}

export interface IBlockWithRelations extends IBlock {
  decisionPoints: IDecisionPointWithRelations[];
  icon: IIconBuilder;
  media: IMedia[];
  blockMedias: IBlockMedia[];
}

export interface IBlockMedia {
  id: string;
  textContentId: string;
  mediaId: string;
  media: IMedia | IMedia[];
}
