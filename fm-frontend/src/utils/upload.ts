import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import nth from 'lodash/nth';
// import { uploadMultipleFiles } from 'API/cms'
import { S3FileTypeEnum } from 'constants/aws';
import { uploadMultipleFiles } from 'API/cms';
import { getThumbnailType } from 'pages/InboxPage/GeneralInbox/components/GeneralDetail/utils';
import { EMediaThumbnail } from 'constants/media';
import { getValidArray } from './common';

export async function handleUploadMultiple(
  attachments: File[],
  organizationId: string
): Promise<{ url: string; name: string; type: EMediaThumbnail }[]> {
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
    imageUrls = await uploadMultipleFiles(
      organizationId,
      S3FileTypeEnum.IMAGE,
      images
    );
  }
  if (!isEmpty(videos)) {
    videoUrls = await uploadMultipleFiles(
      organizationId,
      S3FileTypeEnum.VIDEO,
      videos
    );
  }
  if (!isEmpty(others)) {
    otherUrls = await uploadMultipleFiles(
      organizationId,
      S3FileTypeEnum.OTHER,
      others
    );
  }

  const uploadedImages: string[] = [...imageUrls, ...videoUrls, ...otherUrls];
  const attachmentData: { url: string; name: string; type: EMediaThumbnail }[] =
    uploadedImages
      .map((url) => {
        const fileNameWithTimestamp = last(url.split('/')) || '';
        const fileType = getFileType(url);
        return {
          url,
          name: fileNameWithTimestamp,
          type: fileType,
        };
      })
      .filter((attachment) => attachment.url && attachment.type);

  return attachmentData;
}

export function getFileType(url: string): EMediaThumbnail {
  if (
    url.endsWith('.jpg') ||
    url.endsWith('.svg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.gif') ||
    url.endsWith('.bmp')
  )
    return EMediaThumbnail.PHOTO;
  return getThumbnailType(url);
}
