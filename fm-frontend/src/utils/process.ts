import { ProcessDraftType, ProcessType } from "config/constant/enums/process";

export function toProcedureTypeName(
  procedureType?: number
): keyof typeof ProcessType | undefined {
  if (!procedureType) {
    return undefined;
  }
  return ProcessType[procedureType] as keyof typeof ProcessType;
}

export function toProcessDraftTypeName(
  procedureType?: number
): keyof typeof ProcessDraftType | undefined {
  if (!procedureType) {
    return undefined;
  }
  return ProcessDraftType[procedureType] as keyof typeof ProcessDraftType;
}