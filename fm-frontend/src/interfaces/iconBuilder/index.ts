import { IDocumentType } from "interfaces/documentType";

export interface IIconBuilder {
  id?: string;
  _id?: string;
  shape?: EIconShape;
  color?: string;
  iconName?: string;
  type?: EIconType;
  description?: string;
  isDark?: boolean;
}

export interface IIconBuilderWithRelations extends IIconBuilder {
  documentTypes?: IDocumentType[];
}

export enum EIconShape {
  SQUARE = "square",
  CIRCLE = "circle",
  OCTAGON = "octagon",
  DIAMOND = "diamond",
}

export enum EIconType {
  DOCUMENT_TYPE = "document-type",
  STEP = "step",
  BLOCK = "block",
}

export enum EIconDefaultIconName {
  DOCUMENT_TYPE = "default-document-type-icon",
  BLOCK = "default-block-icon",
  STEP = "default-step-icon",
}

export enum EIconDefaultColor {
  DOCUMENT_TYPE = "#4962FF",
  BLOCK = "#727CF5",
  STEP = "#FFA500",
}

export enum EIconDefaultId {
  DOCUMENT_TYPE = 101,
  BLOCK = 102,
  STEP = 103,
}
