import { ICollection } from "interfaces/collection";
import { IGroup } from "interfaces/groups";
import { IProcessWithRelations } from "interfaces/process";
import { ITag } from "interfaces/tag";

export function getDefaultValues(process: IProcessWithRelations) {
  return {
    name: process?.name ?? "",
    version: process?.version ?? "",
    releaseNote: process?.releaseNote ?? "",
    editorNote: process?.editorNote ?? "",
    documentTypeId: {
      label: process?.documentType?.name ?? "",
      value: process?.documentType?._id ?? process?.documentType?.id ?? "",
    },
    tags: createTagOptions(process?.tags ?? []),
  };
}

export function createOptions(collections: ICollection[]) {
  return collections.map((collection) => ({
    label: collection?.name ?? "",
    value: collection?.id,
  }));
}

export function createTagOptions(tags: ITag[]) {
  return tags.map((tag) => ({
    label: tag?.name ?? "",
    value: String(tag?._id ?? tag?.id ?? ""),
  }));
}

export function createGroupOptions(groups: IGroup[]) {
  return groups.map((group) => ({
    label: group?.name ?? "",
    value: group?.id,
  }));
}
