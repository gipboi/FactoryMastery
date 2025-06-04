import { IOption } from 'types/common'

export interface IFilterForm {
  sortBy?: string
  groups: IOption<string>[]
  processes: IOption<string>[]
  modifiedDate: Date[]
}

export const sortByOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Newest', value: 'createdAt' },
  { label: 'Updated', value: 'updatedAt' }
]

export enum ECollectionFilterName {
  PROCESS = 'processIds',
  GROUPS = 'groupIds',
  PROCESS_DOCUMENT_TYPES = 'documentTypeIds',
  CREATOR = 'creatorIds',
  PROCESS_TAGS = 'tagIds',
  SORT_BY = 'sortBy',
  MODIFIED_DATE = 'modifiedDate',
  USERS = 'users',
  SEARCH = 'search'
}
