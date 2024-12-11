import {
  IDecisionPoint,
  IDecisionPointMedia,
  IDecisionPointMediaWithRelations,
  IDecisionPointStep,
  IDecisionPointStepWithRelations,
  IDecisionPointWithRelations,
} from "interfaces/decisionPoint";
import { createAdditionalCrudService } from "API/additionalCrud";
import { createCrudService } from "API/crud";
import { isEqual, uniqWith } from "lodash";

const decisionPointCrudService = createCrudService<
  IDecisionPoint,
  IDecisionPointWithRelations
>("decision-points");
const decisionPointAdditionalCrudService = createAdditionalCrudService<
  IDecisionPoint,
  IDecisionPointWithRelations
>("decision-points");

const decisionPointMediaCrudService = createCrudService<
  IDecisionPointMedia,
  IDecisionPointMediaWithRelations
>("decision-point-medias");
const decisionPointMediaAdditionalCrudService = createAdditionalCrudService<
  IDecisionPointMedia,
  IDecisionPointMediaWithRelations
>("decision-point-medias");

const decisionPointStepCrudService = createCrudService<
  IDecisionPointStep,
  IDecisionPointStepWithRelations
>("decision-point-steps");
const decisionPointStepAdditionalCrudService = createAdditionalCrudService<
  IDecisionPointStep,
  IDecisionPointStepWithRelations
>("decision-point-steps");

export async function createDecisionPoints(
  decisionPoints: IDecisionPoint[]
): Promise<IDecisionPoint[]> {
  const uniqueData = uniqWith(decisionPoints, isEqual);
  return decisionPointCrudService.createMany(uniqueData);
}

export async function createDecisionPointMedias(
  decisionPointMedias: IDecisionPointMedia[]
): Promise<IDecisionPointMedia[]> {
  const uniqueData = uniqWith(decisionPointMedias, isEqual);
  return decisionPointMediaCrudService.createMany(uniqueData);
}

export async function createDecisionPointSteps(
  decisionPointSteps: IDecisionPointStep[]
): Promise<IDecisionPointStep[]> {
  const uniqueData = uniqWith(decisionPointSteps, isEqual);
  return decisionPointStepCrudService.createMany(uniqueData);
}

export async function dropDecisionPoint(blockId: string): Promise<void> {
  return decisionPointAdditionalCrudService.put("drop", {
    blockId,
  }) as Promise<void>;
}

export async function dropDecisionPointMedia(
  decisionPointId: string
): Promise<void> {
  return decisionPointMediaAdditionalCrudService.put("drop", {
    decisionPointId: decisionPointId,
  }) as Promise<void>;
}

export async function dropDecisionPointStep(
  decisionPointId: string
): Promise<void> {
  return decisionPointStepAdditionalCrudService.put("drop", {
    decisionPointId: decisionPointId,
  }) as Promise<void>;
}
