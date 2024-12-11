import { IOption } from 'types/common/select'

export enum MessageOption {
  MANAGER_COMMENTS = 'manager-comments',
  ALL_COMMENTS = 'all-comments'
}

export const options: IOption<string>[] = [
  {
    label: 'Manager Comments',
    value: MessageOption.MANAGER_COMMENTS
  },
  {
    label: 'All Comments',
    value: MessageOption.ALL_COMMENTS
  }
]
