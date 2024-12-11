import { MediaType, MediaTypeEnum } from "constants/media";
import {
  IDecisionPointLink,
  IDecisionPointLinkForm,
} from "interfaces/decisionPoint";
import { IMedia } from "interfaces/media";
import isEmpty from "lodash/isEmpty";
import StepStore from "stores/stepStore";
import { IOption } from "types/common";
import { SetValue } from "types/hookForm";
import { BlockTextFormValues } from "../../enums";
import { getStepsPipeline } from "./query";

export function searchSteps(
  stepStore: StepStore,
  keyword: string,
  organizationId: number
): void {
  const pipeline = getStepsPipeline(keyword, organizationId);
  stepStore.fetchStepsByAggregate(pipeline);
}

export function handleClickMedia(
  clickedMedia: IMedia,
  linkedMedia: IMedia[],
  setLinkedMedia: (linkedMedia: IMedia[]) => void
): void {
  const foundMedia: IMedia | undefined = linkedMedia?.find(
    (mediaElement: IMedia) =>
      (mediaElement?._id ?? mediaElement?.id) ===
      (clickedMedia?._id ?? clickedMedia?.id)
  );

  if (isEmpty(foundMedia)) {
    setLinkedMedia([...linkedMedia, clickedMedia]);
    return;
  }

  if (!isEmpty(foundMedia)) {
    const newLinkedMedia: IMedia[] = linkedMedia?.filter(
      (mediaElement: IMedia) =>
        (mediaElement?._id ?? mediaElement?.id) !==
        (clickedMedia?._id ?? clickedMedia?.id)
    );
    setLinkedMedia([...newLinkedMedia]);
  }
}

export function handleSave(
  decisionPoints: IDecisionPointLink,
  linkedSteps: IOption<string>[],
  linkedMedia: IMedia[],
  decisionPointIndex: number,
  setValue: SetValue
): void {
  const newDecisionPoints: IDecisionPointLinkForm[] = Array.isArray(
    decisionPoints
  )
    ? decisionPoints.map(
        (decisionPoint: IDecisionPointLinkForm, index: number) => {
          if (index === decisionPointIndex) {
            return {
              ...decisionPoint,
              linkedSteps,
              linkedMedia,
            };
          }
          return decisionPoint;
        }
      )
    : [];
  setValue(BlockTextFormValues.DECISION_POINTS, newDecisionPoints);
}

export function extractMediaByType(
  mediaList: IMedia[],
  type: MediaTypeEnum
): IMedia[] {
  const imageMedia: IMedia[] = Array.isArray(mediaList)
    ? mediaList?.filter((media: IMedia) => media?.mediaType === type)
    : [];

  return imageMedia;
}
