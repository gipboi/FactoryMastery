import {
  IDecisionPointLinkForm,
  IDecisionPointMediaWithRelations,
  IDecisionPointStepWithRelations,
  IDecisionPointWithRelations,
} from "interfaces/decisionPoint";
import { IBlockWithRelations } from "interfaces/block";
import get from "lodash/get";
import { IOption } from "types/common";
import { Reset } from "types/hookForm";
import { IMedia } from "interfaces/media";
import { IStep } from "interfaces/step";

export function extractDecisionPoints(
  decisionPoints: IDecisionPointWithRelations[]
): IDecisionPointLinkForm[] {
  return Array.isArray(decisionPoints)
    ? decisionPoints.map((decisionPoint: IDecisionPointWithRelations) => {
        return {
          content: decisionPoint?.title,
          linkedMedia: decisionPoint?.decisionPointMedias?.map(
            (decisionPointMedia: IDecisionPointMediaWithRelations) =>
              (decisionPointMedia?.media as IMedia[])?.[0] ??
              decisionPointMedia?.media
          ),
          linkedSteps: decisionPoint?.decisionPointSteps?.map(
            (decisionPointStep: IDecisionPointStepWithRelations) => {
              const stepDetail =
                (decisionPointStep?.step as IStep[])?.[0] ??
                decisionPointStep?.step;
              const stepOptions: IOption<string> = {
                label: stepDetail?.name ?? "",
                value: stepDetail?._id ?? stepDetail?.id ?? "",
              };
              return stepOptions;
            }
          ),
        };
      })
    : [];
}

export function getDefaultFormValues(
  reset: Reset,
  blockText: IBlockWithRelations
): void {
  reset({
    isDisableMediaLabel: blockText?.isDisableMediaLabel,
    decisionPoints: extractDecisionPoints(blockText?.decisionPoints),
    iconName: get(blockText, "iconName", ""),
    iconId: get(blockText, "iconId", ""),
  });
}
