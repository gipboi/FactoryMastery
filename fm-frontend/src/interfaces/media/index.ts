import { MediaType, MediaTypeEnum } from "constants/media";

export interface IMedia {
  id: string;
  _id?: string;
  regionContentId?: string;
  organizationId?: string;
  name: string;
  image: string;
  document: string;
  originalImage?: string;
  url?: string;
  mediaType?: MediaTypeEnum;
  position?: number;
  videoThumbnailUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
  stepId?: string;
  video?: string;
  originalFile?: string;
}
