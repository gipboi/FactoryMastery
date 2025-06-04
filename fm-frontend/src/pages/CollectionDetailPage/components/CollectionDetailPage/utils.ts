import { ICollectionsProcess } from "interfaces/collection";
import { getValidArray } from "utils/common";

export function getFilterItemIds(
  params: URLSearchParams,
  collectionName: string
): string[] {
  return params.get(collectionName)
    ? params
        .get(collectionName)
        ?.split(",")
        ?.map((id: string) => String(id)) ?? []
    : [];
}

export function filterProcesses(
  collectionsProcesses: ICollectionsProcess[],
  userIds: string[],
  documentTypeIds: string[],
  tagIds: string[]
): ICollectionsProcess[] {
  if (
    userIds?.length === 0 &&
    documentTypeIds?.length === 0 &&
    tagIds?.length === 0
  ) {
    return getValidArray(collectionsProcesses);
  }

  let filteredProcess: ICollectionsProcess[] = [...collectionsProcesses];

  if (userIds?.length > 0) {
    filteredProcess = getValidArray(filteredProcess).filter(
      (collectionsProcess) =>
        userIds.includes(collectionsProcess?.process?.createdBy ?? "")
    );
  }

  if (documentTypeIds?.length > 0) {
    filteredProcess = getValidArray(filteredProcess).filter(
      (collectionsProcess) =>
        documentTypeIds.includes(
          collectionsProcess?.process?.documentTypeId ?? ""
        )
    );
  }

  if (tagIds?.length > 0) {
    filteredProcess = getValidArray(filteredProcess).filter(
      (collectionsProcess) =>
        collectionsProcess?.process?.tags?.some((tag: any) =>
          tagIds.includes(tag?.tagId ?? "")
        )
    );
  }

  return filteredProcess;
}
