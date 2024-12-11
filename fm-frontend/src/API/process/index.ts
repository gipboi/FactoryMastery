import { IFilter, UpdateBody, Where } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { api } from "API";
import { AggregationPaginated } from "interfaces/common";
import {
  IGroupProcess,
  IProcess,
  IProcessDuplicate,
  IProcessWithRelations,
} from "interfaces/process";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";

const processCrudService = createCrudService<IProcess, IProcessWithRelations>(
  "processes"
);
const processAdditionalCrudService = createAdditionalCrudService<
  IProcess,
  IProcessWithRelations
>("processes");

export async function getProcessById(
  processId: string,
  filter: IFilter<IProcess> = {}
): Promise<IProcessWithRelations> {
  return processAdditionalCrudService.get(
    processId,
    filter
  ) as Promise<IProcessWithRelations>;
}

export async function countProcesses(
  where: Where<IProcess> = {}
): Promise<number> {
  return processCrudService.count(where) as Promise<number>;
}

export async function updateProcessById(
  id: string,
  updateBody: UpdateBody<IProcess>
): Promise<IProcessWithRelations> {
  return processCrudService.update(
    id,
    updateBody
  ) as Promise<IProcessWithRelations>;
}

export async function getDetailProcessById(
  id: string
): Promise<AggregationPaginated<IProcessWithRelations>> {
  return processAdditionalCrudService.get(`${id}/detail`) as Promise<
    AggregationPaginated<IProcessWithRelations>
  >;
}

export async function createProcess(
  process: UpdateBody<IProcess>
): Promise<IProcess> {
  return processCrudService.create(process) as Promise<IProcess>;
}

export async function createGroupProcess(
  groupProcess: IGroupProcess
): Promise<IProcess> {
  const resp = await api.post("/groups-processes", groupProcess);
  return resp.data?.data;
}

export async function getAllProcesses(
  filter: IFilter<IProcess> = {}
): Promise<IProcessWithRelations[]> {
  return processCrudService.get(filter);
}

export async function deleteProcessById(id: string): Promise<void> {
  return processCrudService.delete(id) as Promise<void>;
}

export async function archiveProcessById(id: string): Promise<void> {
  return processAdditionalCrudService.patch(
    `${id}/archive`,
    {}
  ) as Promise<void>;
}

export async function restoreProcessById(id: string): Promise<void> {
  return processAdditionalCrudService.patch(
    `${id}/restore`,
    {}
  ) as Promise<void>;
}

export async function restoreProcessToDraftById(id: string): Promise<void> {
  return processAdditionalCrudService.patch(
    `${id}/restore-to-draft`,
    {}
  ) as Promise<void>;
}

export async function upsertProcessTags(
  id: string,
  tagIds: string[]
): Promise<void> {
  return processAdditionalCrudService.post(`${id}/tags`, {
    tagIds,
  }) as Promise<void>;
}

export async function shareProcessToUsers(
  processId: string,
  userIds: string[]
): Promise<void> {
  return processAdditionalCrudService.patch(
    `${processId}/share-to-users`,
    userIds
  ) as Promise<void>;
}

export async function duplicateProcess(
  processId: string,
  payload: IProcessDuplicate
): Promise<IProcess> {
  return processAdditionalCrudService.post(
    `${processId}/duplicate`,
    payload
  ) as Promise<IProcess>;
}

export async function aggregateProcesses(
  pipeline: AggregationPipeline = []
): Promise<IProcessWithRelations[]> {
  return processAdditionalCrudService.aggregate(pipeline) as Promise<
    IProcessWithRelations[]
  >;
}

export async function aggregateProcessesSearch(
  pipeline: AggregationPipeline = [],
  timeTracking: number = new Date().getTime()
): Promise<AggregationPaginated<IProcess>> {
  const result = (await processAdditionalCrudService.aggregate(
    pipeline
  )) as AggregationPaginated<IProcess>[];
  result[0].timeTracking = timeTracking;
  return result[0] as AggregationPaginated<IProcess>;
}

export async function aggregateCountProcesses(
  pipeline: AggregationPipeline = []
): Promise<number> {
  return processAdditionalCrudService.post("aggregate/count", {
    pipeline,
  }) as Promise<number>;
}
