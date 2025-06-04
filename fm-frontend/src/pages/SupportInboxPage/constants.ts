import { SupportMessageThreadStatus } from "interfaces/message";
import { IDropdown } from "types/common";

export enum ProcessPublishStatus {
  ALL = 0,
  DRAFT = 1,
  PUBLISHED = 2,
}

export interface ISupportThreadFilter {
  sort: ESupportThreadSortBy;
  status: SupportMessageThreadStatus;
  publish: ProcessPublishStatus;
}

export enum ESupportThreadSortBy {
  UNCLAIMED_FIRST = "Unclaimed first",
  NAME = "Name",
  NEWEST = "Newest",
  UPDATED = "Updated",
}

export function getSortByOptions(isBasicUser: boolean): IDropdown[] {
  const sortByOptions: IDropdown[] = [
    { title: ESupportThreadSortBy.NEWEST, value: ESupportThreadSortBy.NEWEST },
    { title: ESupportThreadSortBy.NAME, value: ESupportThreadSortBy.NAME },
    {
      title: ESupportThreadSortBy.UPDATED,
      value: ESupportThreadSortBy.UPDATED,
    },
  ];
  if (!isBasicUser) {
    return [
      {
        title: ESupportThreadSortBy.UNCLAIMED_FIRST,
        value: ESupportThreadSortBy.UNCLAIMED_FIRST,
      },
      ...sortByOptions,
    ];
  }
  return sortByOptions;
}

export function getStatusText(status: SupportMessageThreadStatus): string {
  if (status === SupportMessageThreadStatus.UNCLAIMED) {
    return "Unclaimed";
  }
  if (status === SupportMessageThreadStatus.CLAIMED) {
    return "Claimed";
  }
  if (status === SupportMessageThreadStatus.RESOLVED) {
    return "Resolved";
  }
  return "";
}

export enum EInboxTab {
  SUPPORT = "Support",
  GENERAL = "General",
}

export const MESSAGE_UNSEEN_COLOR = '#3182CE'

export const ThreadStatusColor: { [key: string]: string } = {
  1: '#F03D3D',
  2: '#00A9EB',
  3: '#323A46'
}

export function getSupportMessageStatus(status: SupportMessageThreadStatus) {
  if (status === SupportMessageThreadStatus.UNCLAIMED) {
    return 'Unclaimed'
  }

  if (status === SupportMessageThreadStatus.CLAIMED) {
    return 'Claimed'
  }

  if (status === SupportMessageThreadStatus.RESOLVED) {
    return 'Resolved'
  }

  return ''
}

export enum OptionType {
  USER = 'user',
  GROUP = 'group'
}