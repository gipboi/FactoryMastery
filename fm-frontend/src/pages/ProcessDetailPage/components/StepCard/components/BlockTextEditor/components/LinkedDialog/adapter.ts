import { IStep } from "interfaces/step";
import { IOption } from "types/common";

export function stepToOptions(steps: IStep[]): IOption<string>[] {
  const options: IOption<string>[] = Array.isArray(steps)
    ? steps?.map((step: IStep) => ({
        label: step.name ?? "",
        value: step.id ?? "",
      }))
    : [];

  return options;
}

export function stepToOption(step: IStep): IOption<string> {
  return {
    label: step.name ?? "",
    value: step.id ?? "",
  };
}
