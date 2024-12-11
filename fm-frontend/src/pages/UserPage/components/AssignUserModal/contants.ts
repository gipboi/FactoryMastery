import { IDropdown } from 'types/common'

export enum EAssignUserForm {
  USER_GROUP = 'userGroup',
  PERMISSION = 'permission',
  CHECK_BOX = 'checkBox',
  GROUP_ID = 'groupId'
}

export interface IAssignUserForm {
  userGroup: IAssignUserGroupForm[]
}

export interface IAssignUserGroupForm {
  permission: IDropdown
  groupId: string
  checkBox: boolean
}

export interface IGroupForm {
  groupDetails: IGroupDetail[]
}

export interface IGroupDetail {
  groupId: string
  permission?: string
}
