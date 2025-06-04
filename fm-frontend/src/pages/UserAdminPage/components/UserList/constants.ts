export enum MemberType {
  USER = 'User',
  GROUP = 'Group'
}

export interface IUserListProps {
  enableActionControl: (isEnabled: boolean) => void
  toggleAssignModal: () => void
  openAssignModal: boolean
  fetchUserList: () => Promise<void>
}

export const primary100 = '#DBF8FF'
