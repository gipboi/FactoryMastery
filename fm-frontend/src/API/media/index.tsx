import { MediaTypeEnum } from "constants/media";
import { IMedia } from "interfaces/media";
import { UpdateBody } from "types/common";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";

const mediaCrudService = createCrudService<IMedia, IMedia>("media");
const mediaAdditionalCrudService = createAdditionalCrudService<IMedia, IMedia>(
  "media"
);

export async function createMedia(media: UpdateBody<IMedia>): Promise<IMedia> {
  return mediaCrudService.create(media);
}

export async function updateMediaById(
  id: string,
  updateBody: UpdateBody<IMedia>
): Promise<IMedia> {
  return mediaCrudService.update(id, updateBody);
}

export async function deleteMediaById(id: string): Promise<void> {
  return mediaCrudService.delete(id);
}

export async function dropMediaType(
  mediaType: MediaTypeEnum,
  stepId: string
): Promise<void> {
  return mediaAdditionalCrudService.put(`drop`, {
    mediaType,
    stepId,
  }) as Promise<void>;
}

export async function createManyMedias(
  medias: UpdateBody<IMedia>[]
): Promise<IMedia[]> {
  return mediaCrudService.createMany(medias);
}
