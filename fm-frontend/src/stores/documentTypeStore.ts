import { handleError } from "API";
import {
  countDocumentTypes,
  createDocumentType,
  getDocumentTypeDetail,
  getDocumentTypes,
  getDocumentTypesByAggregate,
  updateDocumentType,
} from "API/documentType";
import { IDocumentType } from "interfaces/documentType";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { AggregationPipeline } from "types/common/aggregation";
import { IFilter } from "types/common/query";

export default class DocumentTypeStore {
  rootStore: RootStore;

  documentTypes: IDocumentType[] = [];
  documentTypesLength: number = 0;
  documentTypeDetail: IDocumentType = {};

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async fetchDocumentTypes(
    filter: IFilter<IDocumentType> = {}
  ): Promise<IDocumentType[]> {
    try {
      const documentTypes: IDocumentType[] = await getDocumentTypes(filter).catch((e) => {
        console.error("Error fetching document types", e);
        return [];
      });;
      this.documentTypes = documentTypes;
      return documentTypes;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsDocumentTypeStore.ts",
        "fetchDocumentTypes"
      );
      return [];
    }
  }

  async fetchCMSDocumentTypeList(
    pipeline: AggregationPipeline = [],
    countPipeline: AggregationPipeline = []
  ): Promise<void> {
    try {
      const [documentTypeList, countDocumentType] = await Promise.all([
        getDocumentTypesByAggregate(pipeline),
        getDocumentTypesByAggregate(countPipeline),
      ]);
      this.documentTypes = documentTypeList as IDocumentType[];
      this.documentTypesLength = (countDocumentType?.[0] as any)?.totalResults;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsDocumentTypeStore.ts",
        "fetchCMSDocumentTypeList"
      );
    }
  }

  async fetchDocumentTypeDetail(
    id: string,
    filter: IFilter<IDocumentType> = {}
  ): Promise<void> {
    try {
      const documentType: IDocumentType = await getDocumentTypeDetail(
        id,
        filter
      );
      this.documentTypeDetail = documentType;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsDocumentTypeStore.ts",
        "fetchDocumentTypeDetail"
      );
    }
  }

  async createNewDocumentType(documentType: IDocumentType): Promise<void> {
    try {
      const newDocumentType: IDocumentType = await createDocumentType(
        documentType
      );
      this.documentTypeDetail = newDocumentType as IDocumentType;
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsDocumentTypeStore.ts",
        "createDocumentType"
      );
    }
  }

  async updateExistedDocumentType(
    id: string,
    documentType: IDocumentType
  ): Promise<void> {
    try {
      await updateDocumentType(id, documentType);
    } catch (error: any) {
      handleError(
        error as Error,
        "stores/cms/cmsDocumentTypeStore.ts",
        "updateDocumentType"
      );
    }
  }

  selectDocumentType(id: string): void {
    if (!id) {
      this.documentTypeDetail = {};
      return;
    }
    this.documentTypeDetail =
      this.documentTypes.find((documentType) => documentType?.id === id) ?? {};
  }

  resetStore(): void {
    this.documentTypeDetail = {};
    this.documentTypes = [];
  }
}
