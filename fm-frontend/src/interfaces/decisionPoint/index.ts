import { IMedia } from "interfaces/media";
import { IStep } from "interfaces/step";
import { IOption } from "types/common";

export interface IDecisionPoint {
  id?: string;
  _id?: string;
  title: string;
  blockId: string;
  position: number;
}

export interface IDecisionPointMedia {
  id?: string;
  decisionPointId: string;
  mediaId: string;
}

export interface IDecisionPointStep {
  id?: string;
  decisionPointId: string;
  stepId: string;
}

export interface IDecisionPointWithRelations extends IDecisionPoint {
  decisionPointMedias: IDecisionPointMediaWithRelations[];
  decisionPointSteps: IDecisionPointStepWithRelations[];
}

export interface IDecisionPointMediaWithRelations extends IDecisionPointMedia {
  media: IMedia | IMedia[];
}

export interface IDecisionPointStepWithRelations extends IDecisionPointStep {
  step: IStep;
}

export interface IDecisionPointLinkForm {
  id?: string;
  content: string;
  linkedSteps: IOption<string>[];
  linkedMedia: IMedia[];
}

export interface IDecisionPointLink {
  id: string;
  content: string;
  decisionPointId: string;
  stepId: string;
  processId: string;
  mediaId: string;
  createdAt: Date;
  updatedAt: Date;
  position: number;
}
