import { EMediaThumbnail, MediaType, MediaTypeEnum } from 'constants/media'
import { IMedia } from 'interfaces/media'

export function getThumbnailType(media: IMedia): EMediaThumbnail {
  if (media?.mediaType === MediaTypeEnum.IMAGE) {
    return EMediaThumbnail.PHOTO
  }

  if (media?.mediaType === MediaTypeEnum.VIDEO) {
    return EMediaThumbnail.VIDEO
  }

  if (media?.mediaType === MediaTypeEnum.EMBED) {
    return EMediaThumbnail.EMBED
  }

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
    { extension: '.wav', type: EMediaThumbnail.AUDIO }
  ]
  const thumbnailType =
    thumbnailTypes.find(
      ({ extension }) => media?.originalFile?.includes(extension) || media?.document?.includes(extension)
    )?.type ?? EMediaThumbnail.UNKNOWN
  return thumbnailType || EMediaThumbnail.UNKNOWN
}
