// import {
//   createDecisionPointMedias,
//   createDecisionPoints,
//   createDecisionPointSteps,
//   dropDecisionPoint,
//   dropDecisionPointMedia,
//   dropDecisionPointStep,
// } from "API/decisionPoint";
import {
  IDecisionPoint,
  IDecisionPointLinkForm,
  IDecisionPointMedia,
  IDecisionPointStep,
  IDecisionPointWithRelations,
} from "interfaces/decisionPoint";
import { IBlockWithRelations } from "interfaces/block";
import get from "lodash/get";
import { IOption } from "types/common";
import { IMedia } from "interfaces/media";
import {
  createDecisionPointMedias,
  createDecisionPoints,
  createDecisionPointSteps,
  dropDecisionPoint,
  dropDecisionPointMedia,
  dropDecisionPointStep,
} from "API/decisionPoint";

export async function createDecisionPoint(
  getValues: () => any,
  blockId: string
): Promise<void> {
  const formValues = getValues();
  const decisionPointsForm: IDecisionPointLinkForm[] =
    get(formValues, "decisionPoints", []) || [];

  const decisionPoints = decisionPointsForm?.map(
    (formValue: IDecisionPointLinkForm, index: number) => {
      const decisionPoint = {
        title: formValue?.content,
        blockId,
        position: index,
      };
      return decisionPoint;
    }
  );

  const newDecisionPoints = await createDecisionPoints(decisionPoints);

  const decisionPointStepArr: IDecisionPointStep[] = [];
  const decisionPointMediaArr: IDecisionPointMedia[] = [];

  newDecisionPoints.forEach((createdDecisionPoint: any, i: number) => {
    const formValue = formValues.decisionPoints[i];
    const linkedSteps: IDecisionPointStep[] =
      formValue?.linkedSteps?.map((linkedStep: IOption<string>) => {
        const decisionPointStep: IDecisionPointStep = {
          decisionPointId: String(createdDecisionPoint.id),
          stepId: linkedStep.value,
        };
        return decisionPointStep;
      }) ?? [];

    const linkedMedias: IDecisionPointMedia[] =
      formValue?.linkedMedia?.map((linkedMedia: IMedia) => {
        const decisionPointMedia: IDecisionPointMedia = {
          decisionPointId: String(createdDecisionPoint.id),
          mediaId: linkedMedia?._id ?? linkedMedia?.id,
        };
        return decisionPointMedia;
      }) ?? [];

    decisionPointStepArr.push(...linkedSteps);
    decisionPointMediaArr.push(...linkedMedias);
  });

  await createDecisionPointSteps(decisionPointStepArr);
  await createDecisionPointMedias(decisionPointMediaArr);
}

export async function clearOldDecisionPoint(
  blockText: IBlockWithRelations
): Promise<void> {
  if (!Array.isArray(blockText?.decisionPoints)) return;

  await Promise.all(
    blockText?.decisionPoints
      ?.map((decisionPoint: IDecisionPointWithRelations) => {
        const blocksId = decisionPoint?.blockId;
        const decisionPointId = decisionPoint?._id ?? decisionPoint?.id ?? "";
        let dropDecisionPointPromises = {};

        if (blocksId) {
          dropDecisionPointPromises = dropDecisionPoint(blocksId);
        }

        const dropDecisionPointMediaPromises =
          dropDecisionPointMedia(decisionPointId);
        const dropDecisionPointStepPromises =
          dropDecisionPointStep(decisionPointId);

        return [
          dropDecisionPointMediaPromises,
          dropDecisionPointStepPromises,
          dropDecisionPointPromises,
        ];
      })
      .flat()
  );
}
