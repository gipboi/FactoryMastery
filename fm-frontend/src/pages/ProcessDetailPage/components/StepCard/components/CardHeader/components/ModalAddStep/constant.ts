import { StepPosition, StepPositionNames } from "constants/processStep";

export const allStepPositionOptions = [
  {
    label: StepPositionNames.AppendToTheEndOfList,
    value: StepPosition.AppendToTheEndOfList,
  },
  {
    label: StepPositionNames.PrependToTheBeginningOfList,
    value: StepPosition.PrependToTheBeginningOfList,
  },
];
