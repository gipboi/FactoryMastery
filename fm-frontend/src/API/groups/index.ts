import {
  IAggregateGroupMemberResult,
  IDuplicateGroupDTO,
  IGroup,
  IGroupMember,
  IUpdateGroupMember,
} from "interfaces/groups";
import { IFilter } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";

const groupCrudService = createCrudService<IGroup, IGroup>("groups");

const groupAdditionalCrudService = createAdditionalCrudService<IGroup, IGroup>(
  "groups"
);

const groupMemberCrudService = createCrudService<IGroupMember, IGroupMember>(
  "group-members"
);

const groupMemberAdditionalCrudService = createAdditionalCrudService<
  IGroupMember,
  IGroupMember
>("group-members");

export async function createGroup(group: IGroup): Promise<void> {
  await groupCrudService.create(group);
}

export async function updateGroupById(
  id: string,
  updatedGroup: IGroup
): Promise<void> {
  await groupCrudService.update(id, updatedGroup);
}

export async function getGroups(
  filter: IFilter<IGroup> = {}
): Promise<IGroup[]> {
  return groupCrudService.get(filter);
}

export async function deleteGroupById(id: string): Promise<void> {
  return groupCrudService.delete(id);
}

export async function updateGroupMemberById(
  id: string,
  updatedGroupMember: Partial<IGroupMember>
): Promise<IGroupMember> {
  return groupMemberCrudService.update(id, updatedGroupMember);
}

export async function removeGroupMemberById(id: string): Promise<void> {
  if (!id) {
    return;
  }
  return groupMemberCrudService.delete(id);
}

export async function getGroupById(id: string): Promise<IGroup> {
  return groupCrudService.getDetail(id);
}

export async function getGroupMembers(
  pipeline: AggregationPipeline = []
): Promise<IAggregateGroupMemberResult> {
  const response = (await groupMemberAdditionalCrudService.aggregate(
    pipeline
  )) as IAggregateGroupMemberResult[];
  return response?.[0] as IAggregateGroupMemberResult;
}

export async function getGroupsByAggregate<T = IGroup>(
  pipeline: AggregationPipeline
): Promise<T[]> {
  return groupAdditionalCrudService.aggregate(pipeline) as Promise<T[]>;
}

export async function aggregateCountGroups(
  pipeline: AggregationPipeline
): Promise<number> {
  const response = (await groupAdditionalCrudService.post("aggregate/count", {
    pipeline,
  })) as { totalResults: number }[];
  return response?.[0]?.totalResults ?? 0;
}

export async function duplicateGroup(
  sourceGroupId: string,
  duplicateGroupDto: IDuplicateGroupDTO
): Promise<IGroup> {
  return groupAdditionalCrudService.post(
    `${sourceGroupId}/duplicate`,
    duplicateGroupDto
  ) as Promise<IGroup>;
}

export async function updateGroupMembers(
  data: IUpdateGroupMember
): Promise<void> {
  return groupMemberAdditionalCrudService.post(
    "batch-update",
    data
  ) as Promise<void>;
}

export async function getNumberOfGroupMember(id: string): Promise<number> {
  return groupAdditionalCrudService.get(
    `${id}/count-member`
  ) as Promise<number>;
}

export async function addGroupMembers(
  groupMembers: IGroupMember[]
): Promise<IGroupMember[]> {
  return groupMemberAdditionalCrudService.post("batch-update", {
    toCreateGroupMembers: groupMembers,
  }) as Promise<IGroupMember[]>;
}
