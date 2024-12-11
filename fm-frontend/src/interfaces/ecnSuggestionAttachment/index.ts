export interface IEcnSuggestionAttachment {
  id: number;
  attachment?: string;
  createdAt?: Date;
  updatedAt?: Date;
  ecnSuggestionId: number;
  originalFile?: string;
}
