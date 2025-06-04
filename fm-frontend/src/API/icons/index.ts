import { createAdditionalCrudService } from "API/additionalCrud";
import { createCrudService } from "API/crud";
import {
  IIconBuilder,
  IIconBuilderWithRelations,
} from "interfaces/iconBuilder";
import { IFilter, UpdateBody } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";

const iconCrudService = createCrudService<IIconBuilder, IIconBuilder>("icons");
const iconAdditionalCrudService = createAdditionalCrudService<
  IIconBuilder,
  IIconBuilder
>("icons");

export async function createIcon(
  icon: UpdateBody<IIconBuilder>
): Promise<IIconBuilder> {
  return iconCrudService.create(icon);
}

export async function updateIcon(
  id: string,
  icon: UpdateBody<IIconBuilder>
): Promise<IIconBuilder> {
  return iconCrudService.update(id, icon);
}

export async function deleteIcon(id: string): Promise<void> {
  return iconCrudService.delete(id);
}

export async function updateIconBatch(
  updateBody: UpdateBody<IIconBuilder[]>
): Promise<void> {
  return iconAdditionalCrudService.patch(
    `position/batch`,
    updateBody
  ) as Promise<void>;
}

export async function deleteAndAssignDefaultIcon(id: string): Promise<void> {
  return iconAdditionalCrudService.delete(`assign-default/${id}`);
}

export async function getIcon(
  filter: IFilter<IIconBuilder>
): Promise<IIconBuilderWithRelations[]> {
  return iconAdditionalCrudService.get(
    `/icons?filter=${JSON.stringify(filter)}`
  ) as Promise<IIconBuilderWithRelations[]>;
}

export async function getIconDetail(
  id: string,
  filter: IFilter<IIconBuilder>
): Promise<IIconBuilderWithRelations> {
  return iconAdditionalCrudService.get(
    `/icons/${id}?filter=${JSON.stringify(filter)}`
  ) as Promise<IIconBuilder>;
}

export async function updateIconById(
  id: string,
  userData: IIconBuilder
): Promise<IIconBuilder> {
  return iconAdditionalCrudService.patch(
    `/icons/${id}`,
    userData
  ) as Promise<IIconBuilder>;
}

export async function getIconsByAggregate(
  pipeline: AggregationPipeline
): Promise<IIconBuilder[]> {
  return iconAdditionalCrudService.aggregate(pipeline) as Promise<
    IIconBuilder[]
  >;
}
