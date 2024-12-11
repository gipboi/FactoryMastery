import { handleError } from "API";
import {
  createFavorite,
  getFavorite,
  getFavoriteDetail,
  updateFavorite,
} from "API/favorite";
import { IFavorite, IFavoriteWithRelations } from "interfaces/favorite";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { IFilter } from "types/common/query";

export default class FavoriteStore {
  rootStore: RootStore;

  favorites: IFavoriteWithRelations[] = [];
  favoriteLength: number = 0;
  favoriteDetail: IFavoriteWithRelations = {};

  selectedFavorite: IFavoriteWithRelations = {};

  loading: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async fetchFavoriteList(filter: IFilter<IFavorite> = {}): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      const favoriteList = await getFavorite(filter);
      this.favorites = favoriteList;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/favoriteStore.ts",
        "fetchCMSFavoriteList"
      );
    }
    this.loading = false;
  }

  async createNewFavorite(favorite: IFavorite): Promise<void> {
    try {
      const newIFavorite: IFavorite = await createFavorite(favorite);
      this.favoriteDetail = newIFavorite as IFavorite;
    } catch (error: any) {
      handleError(error as Error, "stores/favoriteStore.ts", "createIFavorite");
    }
  }

  async fetchFavoriteDetail(
    id: string,
    filter: IFilter<IFavorite> = {}
  ): Promise<void> {
    try {
      const favorite: IFavoriteWithRelations = await getFavoriteDetail(
        id,
        filter
      );
      this.favoriteDetail = favorite;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/favoriteStore.ts",
        "fetchFavoriteDetail"
      );
    }
  }

  setFavoriteDetail(favorite: IFavorite): void {
    this.favoriteDetail = favorite;
  }

  resetFavoriteDetail(): void {
    this.favoriteDetail = {};
  }

  async updateFavorite(id: string, favorite: IFavorite): Promise<void> {
    try {
      await updateFavorite(id, favorite);
    } catch (error: any) {
      handleError(error as Error, "stores/favoriteStore.ts", "updateFavorite");
    }
  }

  setSelectedFavorite(favorite: IFavoriteWithRelations): void {
    this.selectedFavorite = favorite;
  }

  async getIsFavorite(favorite: IFavorite): Promise<boolean> {
    const favorites = await getFavorite({
      where: {
        userId: this.rootStore.userStore.currentUser?.id,
        processId: favorite?.processId ?? undefined,
        collectionId: favorite?.collectionId ?? undefined,
      },
    });
    return !!favorites?.[0];
  }
}
