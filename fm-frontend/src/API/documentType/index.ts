import { IDocumentType } from "interfaces/documentType";
import { IFilter, Where } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { createAdditionalCrudService } from "API/additionalCrud";
import { createCrudService } from "API/crud";

const documentTypeCrudService = createCrudService<IDocumentType, IDocumentType>(
  "document-types"
);
const documentTypeAdditionalCrudService = createAdditionalCrudService<
  IDocumentType,
  IDocumentType
>("document-types");

export async function getDocumentTypesByAggregate(
  pipeline: AggregationPipeline
): Promise<IDocumentType[] | { totalResults: number }[]> {
  return documentTypeAdditionalCrudService.aggregate(pipeline) as Promise<
    IDocumentType[] | { totalResults: number }[]
  >;
}

export async function getDocumentTypes(
  filter: IFilter<IDocumentType>
): Promise<IDocumentType[]> {
  return documentTypeCrudService.get(filter);
}

export async function getDocumentTypeDetail(
  id: string,
  filter: IFilter<IDocumentType>
): Promise<IDocumentType> {
  return documentTypeCrudService.getDetail(id, filter);
}

export async function countDocumentTypes(
  where: Where<IDocumentType> = {}
): Promise<number> {
  return documentTypeCrudService.count(where);
}

export async function createDocumentType(
  userData: IDocumentType
): Promise<IDocumentType> {
  return documentTypeCrudService.create(userData);
}

export async function updateDocumentType(
  id: string,
  userData: IDocumentType
): Promise<IDocumentType> {
  return documentTypeCrudService.update(id, userData);
}

export async function deleteDocumentType(id: string): Promise<void> {
  return documentTypeCrudService.delete(id);
}
