import { IFilter, Where } from "types/common";
import { IBlock, IBlockWithRelations } from "interfaces/block";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";

const blockCrudService = createCrudService<IBlock, IBlockWithRelations>(
  "blocks"
);
const blockAdditionalCrudService = createAdditionalCrudService<
  IBlock,
  IBlockWithRelations
>("blocks");

export const createBlock = async (
  data: Partial<IBlock>
): Promise<IBlockWithRelations> => {
  return blockCrudService.create(data);
};

export const countBlock = (where: Where<IBlock> = {}): Promise<number> => {
  return blockCrudService.count(where);
};

export const getBlock = async (
  filter: IFilter<IBlock>
): Promise<IBlockWithRelations[]> => {
  const data = await blockCrudService.get(filter);
  return (data as any)?.data?.blocks ?? [];
};

export const getBlockDetail = (
  id: string,
  filter: IFilter<IBlock>
): Promise<IBlockWithRelations> => {
  return blockCrudService.getDetail(id, filter);
};

export const updateBlockById = (
  id: string,
  data: Partial<IBlock>
): Promise<IBlock> => {
  return blockCrudService.update(id, data);
};

export const deleteBlockById = (id: string): Promise<void> => {
  return blockCrudService.delete(id);
};

export const upsertMedia = async (
  id: string,
  mediaIds: string[]
): Promise<void> => {
  await blockAdditionalCrudService.patch(`${id}/upsert-media`, mediaIds);
};
