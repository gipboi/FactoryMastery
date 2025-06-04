import { handleError } from "API";
import {
  createIcon,
  getIconDetail,
  getIconsByAggregate,
  updateIcon,
} from "API/icons";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { AggregationPipeline } from "types/common/aggregation";
import { IFilter } from "types/common/query";
import {
  EIconShape,
  EIconType,
  IIconBuilder,
  IIconBuilderWithRelations,
} from "./../interfaces/iconBuilder/index";

export default class IconBuilderStore {
  rootStore: RootStore;

  iconBuilders: IIconBuilderWithRelations[] = [];
  defaultIcons: IIconBuilderWithRelations[] = [];
  documentTypeIcons: IIconBuilderWithRelations[] = [];
  stepIcons: IIconBuilderWithRelations[] = [];
  blockIcons: IIconBuilderWithRelations[] = [];
  iconBuilderLength: string = "";
  iconDetail: IIconBuilderWithRelations = {};

  selectedIcon: IIconBuilderWithRelations = { shape: EIconShape.SQUARE };

  loading: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  async fetchCMSIconList(
    pipeline: AggregationPipeline = [
      {
        $match: {
          $or: [
            { isDefaultIcon: true },
            { organizationId: { $exists: false } },
            {
              $expr: {
                $eq: [
                  '$organizationId',
                  {
                    $toObjectId: this.rootStore.organizationStore.organization?.id,
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "documentTypes",
          localField: "documentTypeId",
          foreignField: "_id",
          as: "documentTypes",
        },
      },
    ]
  ): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      const iconBuilderList = await getIconsByAggregate(pipeline);
      const defaultIcons: IIconBuilderWithRelations[] = iconBuilderList.filter(
        (icon: IIconBuilderWithRelations) => icon?.isDefaultIcon === true
      );
      this.defaultIcons = defaultIcons;
      const sortedIcons: IIconBuilderWithRelations[] = [
        ...defaultIcons,
        ...iconBuilderList.filter(
          (icon: IIconBuilderWithRelations) => !icon?.isDefaultIcon
        ),
      ];
      this.iconBuilders = sortedIcons;
      this.documentTypeIcons = sortedIcons.filter(
        (icon) => icon.type === EIconType.DOCUMENT_TYPE
      );
      this.stepIcons = sortedIcons.filter(
        (icon) => icon.type === EIconType.STEP
      );
      this.blockIcons = sortedIcons.filter(
        (icon) => icon.type === EIconType.BLOCK
      );
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/iconBuilderStore.ts",
        "fetchCMSIconList"
      );
    }
    this.loading = false;
  }

  getIconById(id: string): IIconBuilderWithRelations | undefined {
    return this.iconBuilders.find((icon) => icon.id === id);
  }

  async fetchDocumentTypeIconList(
    pipeline: AggregationPipeline = [
      {
        $match: {
          type: EIconType.DOCUMENT_TYPE,
          $or: [
            { isDefaultIcon: true },
            { organizationId: { $exists: false } },
            {
              $expr: {
                $eq: [
                  '$organizationId',
                  {
                    $toObjectId: this.rootStore.organizationStore.organization?.id,
                  },
                ],
              },
            },
          ],
        },
      },
    ]
  ): Promise<void> {
    try {
      const iconBuilderList = await getIconsByAggregate(pipeline);
      this.documentTypeIcons = iconBuilderList;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/iconBuilderStore.ts",
        "fetchDocumentTypeIconList"
      );
    }
  }

  async fetchBlockIconList(
    pipeline: AggregationPipeline = [
      {
        $match: {
          type: EIconType.BLOCK,
          $or: [
            { isDefaultIcon: true },
            { organizationId: { $exists: false } },
            {
              $expr: {
                $eq: [
                  '$organizationId',
                  {
                    $toObjectId: this.rootStore.organizationStore.organization?.id,
                  },
                ],
              },
            },
          ],
        },
      },
    ]
  ): Promise<void> {
    try {
      const iconBuilderList = await getIconsByAggregate(pipeline);
      this.blockIcons = iconBuilderList;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/iconBuilderStore.ts",
        "fetchBlockIconList"
      );
    }
  }

  async fetchStepIconList(
    pipeline: AggregationPipeline = [
      {
        $match: {
          type: EIconType.STEP,
          $or: [
            { isDefaultIcon: true },
            { organizationId: { $exists: false } },
            {
              $expr: {
                $eq: [
                  '$organizationId',
                  {
                    $toObjectId: this.rootStore.organizationStore.organization?.id,
                  },
                ],
              },
            },
          ],
        },
      },
    ]
  ): Promise<void> {
    try {
      const iconBuilderList = await getIconsByAggregate(pipeline);
      this.stepIcons = iconBuilderList;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/iconBuilderStore.ts",
        "fetchStepIconList"
      );
    }
  }

  async createNewIcon(iconBuilder: IIconBuilder): Promise<void> {
    try {
      const newIIconBuilder: IIconBuilder = await createIcon(iconBuilder);
      this.iconDetail = newIIconBuilder as IIconBuilder;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/iconBuilderStore.ts",
        "createIIconBuilder"
      );
    }
  }

  async fetchIconDetail(
    id: string,
    filter: IFilter<IIconBuilder> = {}
  ): Promise<void> {
    try {
      const iconBuilders: IIconBuilderWithRelations = await getIconDetail(
        id,
        filter
      );
      this.iconDetail = iconBuilders;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/iconBuilderStore.ts",
        "fetchIconDetail"
      );
    }
  }

  setIconDetail(iconBuilder: IIconBuilder): void {
    this.iconDetail = iconBuilder;
    this.selectedIcon = iconBuilder;
  }

  resetIconDetail(): void {
    this.iconDetail = {};
  }

  async updateIcon(id: string, iconBuilder: IIconBuilder): Promise<void> {
    try {
      await updateIcon(id, iconBuilder);
    } catch (error: any) {
      handleError(error as Error, "stores/iconBuilderStore.ts", "updateIcon");
    }
  }

  setSelectedIcon(icon: IIconBuilderWithRelations): void {
    this.selectedIcon = icon;
  }
}
