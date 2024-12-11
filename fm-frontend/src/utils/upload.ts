import isEmpty from "lodash/isEmpty";
import last from "lodash/last";
import nth from "lodash/nth";
// import { uploadMultipleFiles } from 'API/cms'
import { S3FileTypeEnum } from "constants/aws";

export async function handleUploadMultiple(
  attachments: File[],
  organizationId: number
): Promise<{ name: string; type: S3FileTypeEnum }[]> {
  const images = attachments.filter((attachment) =>
    attachment?.type?.includes(S3FileTypeEnum.IMAGE)
  );
  const videos = attachments.filter((attachment) =>
    attachment?.type?.includes(S3FileTypeEnum.VIDEO)
  );
  const others = attachments.filter(
    (attachment) =>
      !attachment?.type?.includes(S3FileTypeEnum.VIDEO) &&
      !attachment?.type?.includes(S3FileTypeEnum.IMAGE)
  );
  let imageUrls: string[] = [];
  let videoUrls: string[] = [];
  let otherUrls: string[] = [];

  if (!isEmpty(images)) {
    // imageUrls = await uploadMultipleFiles(
    //   organizationId,
    //   S3FileTypeEnum.IMAGE,
    //   images
    // );
  }
  if (!isEmpty(videos)) {
    // videoUrls = await uploadMultipleFiles(
    //   organizationId,
    //   S3FileTypeEnum.VIDEO,
    //   videos
    // );
  }
  if (!isEmpty(others)) {
    // otherUrls = await uploadMultipleFiles(
    //   organizationId,
    //   S3FileTypeEnum.OTHER,
    //   others
    // );
  }

  const uploadedImages: string[] = [...imageUrls, ...videoUrls, ...otherUrls];
  const attachmentData: { name: string; type: S3FileTypeEnum }[] =
    uploadedImages
      .map((url) => {
        const fileNameWithTimestamp = last(url.split("/")) || "";
        const fileType = getFileType(url);
        return {
          name: fileNameWithTimestamp,
          type: fileType,
        };
      })
      .filter((attachment) => attachment.name && attachment.type);

  return attachmentData;
}

export function getFileType(url: string): S3FileTypeEnum {
  const fileType = nth(url?.split("/"), -2) || "";

  if (fileType.includes(S3FileTypeEnum.IMAGE)) {
    return S3FileTypeEnum.IMAGE;
  }

  if (fileType.includes(S3FileTypeEnum.VIDEO)) {
    return S3FileTypeEnum.VIDEO;
  }

  return S3FileTypeEnum.OTHER;
}
