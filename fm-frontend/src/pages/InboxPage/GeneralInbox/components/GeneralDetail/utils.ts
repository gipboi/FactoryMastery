import { S3FileTypeEnum } from 'constants/aws'
import { EMediaThumbnail, MediaTypeEnum } from 'constants/media'
import { IMessageAttachment } from 'interfaces/message'
import { getValidArray } from 'utils/common'

export function getThumbnailType(name: string): EMediaThumbnail {
  const thumbnailTypes = [
    { extension: '.doc', type: EMediaThumbnail.WORD },
    { extension: '.pdf', type: EMediaThumbnail.PDF },
    { extension: '.xls', type: EMediaThumbnail.EXCEL },
    { extension: '.ppt', type: EMediaThumbnail.PPT },
    { extension: '.csv', type: EMediaThumbnail.CSV },
    { extension: '.mp4', type: EMediaThumbnail.VIDEO },
    { extension: '.wmv', type: EMediaThumbnail.VIDEO },
    { extension: '.webm', type: EMediaThumbnail.VIDEO },
    { extension: '.mv4', type: EMediaThumbnail.VIDEO },
    { extension: '.mov', type: EMediaThumbnail.VIDEO },
    { extension: '.zip', type: EMediaThumbnail.COMPRESSED },
    { extension: '.rar', type: EMediaThumbnail.COMPRESSED },
    { extension: '.7z', type: EMediaThumbnail.COMPRESSED },
    { extension: '.mp3', type: EMediaThumbnail.AUDIO },
    { extension: '.wav', type: EMediaThumbnail.AUDIO },
  ];
  const thumbnailType =
    thumbnailTypes.find(({ extension }) => name?.includes(extension))?.type ||
    EMediaThumbnail.UNKNOWN;

  return thumbnailType || EMediaThumbnail.UNKNOWN;
}

export function checkValidAttachment(attachment: IMessageAttachment): boolean {
  const validTypes = [
    EMediaThumbnail.PDF,
    EMediaThumbnail.EXCEL,
    EMediaThumbnail.WORD,
    EMediaThumbnail.VIDEO,
  ];
  return (
    attachment?.type === S3FileTypeEnum.IMAGE ||
    validTypes.includes(getThumbnailType(attachment?.name))
  );
}

export function getValidAttachments(
  attachments: IMessageAttachment[]
): IMessageAttachment[] {
  return getValidArray(attachments).filter((attachment) =>
    checkValidAttachment(attachment)
  );
}

export function getMediaTypeFromThumbnailType(
  thumbnailType: EMediaThumbnail
): MediaTypeEnum {
  switch (thumbnailType) {
    case EMediaThumbnail.PHOTO:
      return MediaTypeEnum.IMAGE;
    case EMediaThumbnail.VIDEO:
      return MediaTypeEnum.VIDEO;
    case EMediaThumbnail.AUDIO:
      return MediaTypeEnum.AUDIO;
    case EMediaThumbnail.PDF:
    case EMediaThumbnail.WORD:
    case EMediaThumbnail.CSV:
    case EMediaThumbnail.EXCEL:
    case EMediaThumbnail.PPT:
      return MediaTypeEnum.DOCUMENT;
    case EMediaThumbnail.EMBED:
      return MediaTypeEnum.EMBED;
    default:
      return MediaTypeEnum.OTHER;
  }
}