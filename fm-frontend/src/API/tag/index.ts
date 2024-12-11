import { ITag } from "interfaces/tag";
import { IFilter, Where } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";

const tagCrudService = createCrudService<ITag, ITag>("tags");
const tagAdditionalCrudService = createAdditionalCrudService<ITag, ITag>(
  "tags"
);

export async function getTags(filter: IFilter<ITag>): Promise<ITag[]> {
  return tagCrudService.get(filter);
}

export async function getTagDetail(
  id: string,
  filter: IFilter<ITag>
): Promise<ITag> {
  return tagCrudService.getDetail(id, filter);
}

export async function countTags(where: Where<ITag> = {}): Promise<number> {
  return tagCrudService.count(where);
}

export async function createTag(userData: ITag): Promise<ITag> {
  return tagCrudService.create(userData);
}

export async function updateTag(id: string, userData: ITag): Promise<ITag> {
  return tagCrudService.update(id, userData);
}

export async function deleteTag(id: string): Promise<void> {
  return tagCrudService.delete(id);
}

export async function getTagsByAggregate(
  pipeline: AggregationPipeline
): Promise<ITag[]> {
  return tagAdditionalCrudService.aggregate(pipeline) as Promise<ITag[]>;
}
