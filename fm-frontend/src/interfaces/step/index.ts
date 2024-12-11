import { ICommonLibrary } from "interfaces/commonLibrary";
import { IEcnSuggestionWithRelations } from "interfaces/ecnSuggestion";
import { IIconBuilder } from "interfaces/iconBuilder";
import { IMedia } from "interfaces/media";
import { IProcessWithRelations } from "interfaces/process";
import { IBlockWithRelations } from "interfaces/block";
import { IAsyncSelectOption } from "interfaces";

export interface IStep {
  id?: string;
  _id?: string;
  name?: string;
  time?: string;
  processId?: string;
  layoutId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  position?: number;
  quizId?: number;
  archived?: boolean;
  iconId?: number;
  originalStepId?: string;

  icon?: IIconBuilder;

  originalStep?: IStepWithRelations;
  addOption?: number;
  addPosition?: number;
  selectedPosition?: number;
  selectedCommonStepId?: string;
  commonLibrary?: ICommonLibrary;
  isDeleted?: boolean;
  isSeenDeleted?: boolean;
}
export interface IStepWithRelations extends IStep {
  process?: IProcessWithRelations;
  media?: IMedia[];
  blocks?: IBlockWithRelations[];
  ecnSuggestions?: IEcnSuggestionWithRelations[];
  icon?: IIconBuilder;
}

export interface ICreateStepForm {
  name: string;
  processId: string;
  stepPosition: string;
}