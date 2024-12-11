import { IStep } from "interfaces/step";
import { UpdateBody } from "types/common";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";

const stepCrudService = createCrudService<IStep, IStep>("steps");
const stepAdditionalCrudService = createAdditionalCrudService<IStep, IStep>(
  "steps"
);

export async function createStep(step: UpdateBody<IStep>): Promise<IStep> {
  return stepCrudService.create(step);
}

export async function updateStepById(
  id: string,
  step: UpdateBody<IStep>
): Promise<IStep> {
  return stepCrudService.update(id, step);
}

export async function deleteStepById(stepId: string): Promise<void> {
  return stepCrudService.delete(stepId);
}

export async function updateStepBatch(
  updateBody: UpdateBody<IStep[]>
): Promise<void> {
  return stepAdditionalCrudService.patch(
    `position/batch`,
    updateBody
  ) as Promise<void>;
}

export async function updateDerivedStep(
  stepId: string,
  originalStepId: string
): Promise<void> {}
