import { IProcessWithRelations } from "interfaces/process";
import { IStep } from "interfaces/step";

export interface ICommonLibrary {
  id: string;
  organizationId: string;
  processId: string;
  stepId: string;
  updatedAt: Date;
  createdAt: Date;

  step?: IStep;
  process?: IProcessWithRelations;
}
