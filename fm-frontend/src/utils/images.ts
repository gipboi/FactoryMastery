import config from "config";
import { S3FileTypeEnum } from "constants/aws";

export function getProcessImage(processId: number, imageName: string): string {
  const imageUrl: string = `${config.assetsUrl}/standard_operating_procedure/images/${processId}/${imageName}`;
  return imageUrl;
}

export function getCollectionImage(
  collectionId: number,
  imageName: string
): string {
  const imageUrl: string = `${config.assetsUrl}/collection/media/${collectionId}/${imageName}`;
  return imageUrl;
}

export function getMediaImage(mediaId: number, imageName: string): string {
  const imageUrl: string = `${config.assetsUrl}/medium/images/${mediaId}/${imageName}`;
  return imageUrl;
}

export function getS3FileUrl(
  fileType: S3FileTypeEnum,
  organizationId: number,
  imageName: string
): string {
  const imageUrl: string = `${config.assetsUrl}/organizations/${organizationId}/${fileType}s/${imageName}`;
  return imageUrl;
}

export function getUserImage(userId: number, imageName: string): string {
  const imageUrl: string = `${config.assetsUrl}/user/images/${userId}/${imageName}`;
  return imageUrl;
}
