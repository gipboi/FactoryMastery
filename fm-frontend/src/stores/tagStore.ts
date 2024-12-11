import { handleError } from "API";
import {
  createTag,
  getTagDetail,
  getTags,
  getTagsByAggregate,
  updateTag,
} from "API/tag";
import { ITag } from "interfaces/tag";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { AggregationPipeline } from "types/common/aggregation";
import { IFilter } from "types/common/query";

export default class TagStore {
  rootStore: RootStore;

  tags: ITag[] = [];
  tagsLength: number = 0;
  tagDetail: ITag = {};

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async fetchTags(filter: IFilter<ITag> = {}): Promise<ITag[]> {
    try {
      const tags: ITag[] = await getTags(filter).catch((e) => {
        console.error("Error fetching tags", e);
        return [];
      });
      this.tags = tags;
      return tags;
    } catch (error: any) {
      handleError(error as Error, "stores/cms/cmsTagStore.ts", "fetchTags");
      return [];
    }
  }

  async fetchCMSTagList(
    pipeline: AggregationPipeline = [],
    countPipeline: AggregationPipeline = []
  ): Promise<void> {
    try {
      const [tagList, countTag] = await Promise.all([
        getTagsByAggregate(pipeline),
        getTagsByAggregate(countPipeline),
      ]);
      this.tags = tagList;
      this.tagsLength = (countTag?.[0] as any)?.totalResults;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsTagStore.ts",
        "fetchCMSTagList"
      );
    }
  }

  async fetchTagDetail(id: string, filter: IFilter<ITag> = {}): Promise<void> {
    try {
      const tag: ITag = await getTagDetail(id, filter);
      this.tagDetail = tag;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsTagStore.ts",
        "fetchTagDetail"
      );
    }
  }

  async createNewTag(tag: ITag): Promise<void> {
    try {
      const newTag: ITag = await createTag(tag);
      this.tagDetail = newTag as ITag;
    } catch (error: any) {
      handleError(error as Error, "stores/cms/cmsTagStore.ts", "createTag");
    }
  }

  async updateExistedTag(id: string, tag: ITag): Promise<void> {
    try {
      await updateTag(id, tag);
    } catch (error: any) {
      handleError(error as Error, "stores/cms/cmsTagStore.ts", "updateTag");
    }
  }

  selectTag(id: string): void {
    if (!id) {
      this.tagDetail = {};
      return;
    }
    this.tagDetail = this.tags.find((tag) => tag?.id === id) ?? {};
  }

  resetStore(): void {
    this.tagDetail = {};
    this.tags = [];
  }
}
