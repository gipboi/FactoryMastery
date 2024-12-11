import { createAdditionalCrudService } from "API/additionalCrud";
import { createCrudService } from "API/crud";
import { IFavorite, IFavoriteWithRelations } from "interfaces/favorite";
import { IFilter, Where } from "types/common";

const favoriteCrudService = createCrudService<
  IFavorite,
  IFavoriteWithRelations
>("favorites");
const favoriteAdditionalCrudService = createAdditionalCrudService<
  IFavorite,
  IFavoriteWithRelations
>("favorites");

export const createFavorite = (
  data: IFavorite
): Promise<IFavoriteWithRelations> => {
  return favoriteCrudService.create(data);
};

export const countFavorite = (
  where: Where<IFavorite> = {}
): Promise<number> => {
  return favoriteCrudService.count(where);
};

export const getFavorite = async (
  filter: IFilter<IFavorite>
): Promise<IFavoriteWithRelations[]> => {
  return favoriteCrudService.get(filter);
};

export const getFavoriteDetail = (
  id: string,
  filter: IFilter<IFavorite>
): Promise<IFavoriteWithRelations> => {
  return favoriteCrudService.getDetail(id, filter);
};

export const updateFavorite = (
  id: string,
  data: IFavorite
): Promise<IFavorite> => {
  return favoriteCrudService.update(id, data);
};

export const deleteFavorite = (id: string): Promise<void> => {
  return favoriteCrudService.delete(id);
};

export const toggleFavorite = async (data: IFavorite): Promise<void> => {
  await favoriteAdditionalCrudService.put("toggle", data);
};
