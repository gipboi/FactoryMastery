import { EMediaThumbnail } from 'constants/media'

export function getThumbnailType(file: File): EMediaThumbnail {
  const thumbnailTypes = [
    { extension: 'doc', type: EMediaThumbnail.WORD },
    { extension: 'pdf', type: EMediaThumbnail.PDF },
    { extension: 'xls', type: EMediaThumbnail.EXCEL },
    { extension: 'ppt', type: EMediaThumbnail.PPT },
    { extension: 'csv', type: EMediaThumbnail.CSV },
    { extension: 'mp4', type: EMediaThumbnail.VIDEO },
    { extension: 'wmv', type: EMediaThumbnail.VIDEO },
    { extension: 'webm', type: EMediaThumbnail.VIDEO },
    { extension: 'mv4', type: EMediaThumbnail.VIDEO },
    { extension: 'mov', type: EMediaThumbnail.VIDEO },
    { extension: 'zip', type: EMediaThumbnail.COMPRESSED },
    { extension: 'rar', type: EMediaThumbnail.COMPRESSED },
    { extension: '7z', type: EMediaThumbnail.COMPRESSED },
    { extension: 'mp3', type: EMediaThumbnail.AUDIO },
    { extension: 'wav', type: EMediaThumbnail.AUDIO }
  ]
  const fileExtension: string = (file?.name ?? '').split('.').pop() ?? ''
  const thumbnailType = thumbnailTypes.find(({ extension }) => fileExtension?.includes(extension))?.type

  return thumbnailType || EMediaThumbnail.UNKNOWN
}
