import { IFilter } from 'types/common'
import { IGroupProcess } from 'interfaces/process'
import { createAdditionalCrudService } from 'API/additionalCrud'
import { createCrudService } from 'API/crud'

const groupProcessCrudService = createCrudService<IGroupProcess, IGroupProcess>(
  "group-processes"
);
const groupProcessAdditionalCrudService = createAdditionalCrudService<
  IGroupProcess,
  IGroupProcess
>("group-processes");

export async function getGroupsProcesses(filter: IFilter<IGroupProcess>): Promise<IGroupProcess[]> {
  return groupProcessCrudService.get(filter)
}

export async function shareProcessToGroups(groupIds: string[], processId: string): Promise<void> {
  return groupProcessAdditionalCrudService.post("share-to-groups", { groupIds, processId }) as Promise<void>
}

export async function shareProcessesToGroups(groupIds: string[], processIds: string[]): Promise<void> {
  return groupProcessAdditionalCrudService.post("share-to-groups/batch", { groupIds, processIds }) as Promise<void>
}

