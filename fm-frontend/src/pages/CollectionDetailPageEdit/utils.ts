import { IGroup } from "interfaces/groups";
import { IProcessWithRelations } from "interfaces/process";
import uniqBy from "lodash/uniqBy";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";

export function getGroupOptionSelect(groupList?: IGroup[]): IOption<string>[] {
  let groupOptions: IOption<string>[] = [];
  let groups: string[] = [];
  getValidArray(groupList).forEach((group: IGroup) => {
    if (!groups.includes(String(group?.id ?? "")) && group?.name) {
      groups = groups.concat(String(group?.id));
      groupOptions = [
        ...groupOptions,
        {
          value: String(group?.id),
          label: group?.name,
        },
      ];
    }
  });
  return groupOptions;
}

export function getProcessOptionSelect(
  groupList?: IProcessWithRelations[]
): IOption<string>[] {
  let processOptions: IOption<string>[] = [];
  let processes: string[] = [];
  getValidArray(groupList).forEach((process: IProcessWithRelations) => {
    if (!processes.includes(String(process?.id ?? "")) && process?.name) {
      processes = processes.concat(String(process?.id));
      processOptions = [
        ...processOptions,
        {
          value: String(process?.id),
          label: process?.name,
        },
      ];
    }
  });
  return processOptions;
}

export function sortValidProcesses(
  processList: IProcessWithRelations[],
  selectedProcesses: IProcessWithRelations[],
  processKeyword: string
): IProcessWithRelations[] {
  if (processKeyword) {
    return processList;
  }

  const selectedProcessIds: string[] = getValidArray(selectedProcesses)
    .map((process) => process?.id)
    .filter((id) => Number(id) >= 0);
  const remainProcesses: IProcessWithRelations[] = getValidArray(
    processList
  ).filter((process) => !selectedProcessIds.includes(process?.id));

  return uniqBy([...selectedProcesses, ...remainProcesses], "id");
}
