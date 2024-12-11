import { IDropdown } from "types/common/select";

export const PROCESS_MODAL_ID = "process-modal-id";

export enum EDraftTab {
  PROCESS = "Process",
  COLLECTION = "Collection",
}

export enum EProcessesFilterFormName {
  COLLECTION = "collections",
  GROUP = "groups",
  TAG = "tags",
  DOCUMENT_TYPE = "documentTypes",
}

export const draftSortByOptions: IDropdown[] = [
  { title: "Last updated", value: "Last updated" },
  { title: "Newest", value: "Newest" },
  { title: "Name (A-Z)", value: "Name (A-Z)" },
];
