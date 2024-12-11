import { EMediaThumbnail, MediaType, MediaTypeEnum } from 'constants/media'
import { IMedia } from 'interfaces/media'

export function extractMediaByType(mediaList: IMedia[], type: MediaTypeEnum): IMedia[] {
  const imageMedia: IMedia[] = Array.isArray(mediaList)
    ? mediaList?.filter((media: IMedia) => media?.mediaType === type)
    : []

  return imageMedia
}

export function convertToEmbedLink(url: string): string {
  const youTubeRegExp: RegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = String(url)?.toLowerCase().match(youTubeRegExp)
  return match?.[2] ? `https://www.youtube.com/embed/${match[2]}` : url
}

export function getOfficeAppLiveUrl(url: string): string {
  if (String(url)?.toLowerCase()?.includes('pdf')) {
    return `https://docs.google.com/viewer?url=${url}&embedded=true`
  }
  const encodedUrl = encodeURIComponent(url)
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}&wdOrigin=BROWSELINK`
}

export function getFileType(file: File) {
  const fileTypes = [
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
  const fileType = fileTypes.find(({ extension }) => String(fileExtension)?.toLowerCase()?.includes(extension))?.type

  return fileType?.toLowerCase()
}
