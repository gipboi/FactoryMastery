import { S3FileTypeEnum } from 'constants/aws'
import { EMediaThumbnail } from 'constants/media'
import { IMessageAttachment, ISupportMessageThread } from 'interfaces/message'
import { getValidArray } from 'utils/common'
import { ProcessPublishStatus } from '../constants'
import { trim } from 'lodash'
import { IUser } from 'interfaces/user'
import { aggregateProcesses } from 'API/process'
import { AggregationPipeline } from 'types/common/aggregation'

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
    { extension: '.wav', type: EMediaThumbnail.AUDIO }
  ]
  const thumbnailType =
    thumbnailTypes.find(({ extension }) => name?.includes(extension))?.type || EMediaThumbnail.UNKNOWN

  return thumbnailType || EMediaThumbnail.UNKNOWN
}

export function checkValidAttachment(attachment: IMessageAttachment): boolean {
  const validTypes = [EMediaThumbnail.PDF, EMediaThumbnail.EXCEL, EMediaThumbnail.WORD, EMediaThumbnail.VIDEO]
  return attachment?.type === S3FileTypeEnum.IMAGE || validTypes.includes(getThumbnailType(attachment?.name))
}

export function getValidAttachments(attachments: IMessageAttachment[]): IMessageAttachment[] {
  return getValidArray(attachments).filter(
    attachment => checkValidAttachment(attachment)
  )
}

export function getThreadTitle(thread: ISupportMessageThread): string {
  if (thread?.step?.id) {
    return `${thread?.step?.name} | ${thread?.step?.process?.name}`
  }
  if (thread?.process?.id) {
    return thread?.process?.name ?? ''
  }
  return ''
}

export async function getAdminsOfGroupInTheProcess(
  processId: string
): Promise<IUser[]> {
  const pipeline: any[] = [
    {
      $match: {
        _id: processId,
      },
    },
    {
      $lookup: {
        from: "groupprocesses",
        localField: "_id",
        foreignField: "processId",
        as: "groupProcesses",
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "groupProcesses.groupId",
        foreignField: "_id",
        as: "groups",
      },
    },
    {
      $unwind: {
        path: "$groups",
      },
    },
    {
      $project: {
        _id: false,
        group: "$groups",
        processId: "$_id",
      },
    },
    {
      $lookup: {
        from: "groupmembers",
        localField: "group._id",
        foreignField: "groupId",
        as: "groupMembers",
      },
    },
    {
      $unwind: {
        path: "$groupMembers",
      },
    },
    {
      $match: {
        "groupMembers.admin": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "groupMembers.memberId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
    {
      $project: {
        id: "$user._id",
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        email: "$user.email",
        username: "$user.username",
        image: "$user.image",
      },
    },
  ];

  const admins = await aggregateProcesses(pipeline);
  return admins as unknown as IUser[];
}

export async function getCreatorOfProcess(
  processId: string
): Promise<IUser | null> {
  const pipeline: AggregationPipeline = [
    {
      $match: {
        _id: processId,
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
    {
      $project: {
        id: "$user._id",
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        email: "$user.email",
        username: "$user.username",
        image: "$user.image",
      },
    },
  ];

  const processUsers = (await aggregateProcesses(
    pipeline
  )) as unknown as IUser[];
  const creator: IUser | null = getValidArray(processUsers)[0] ?? null;
  return creator;
}
