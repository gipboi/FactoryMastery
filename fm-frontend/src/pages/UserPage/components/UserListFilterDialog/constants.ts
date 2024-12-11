export enum ESortingUserOptions {
  NAME = 'name',
  NEWEST = 'newest',
  LAST_LOGIN = 'lastLogin'
}

export const allSortingUserOptions = [
  { label: 'Name', value: ESortingUserOptions.NAME },
  { label: 'Newest', value: ESortingUserOptions.NEWEST },
  { label: 'Last Login', value: ESortingUserOptions.LAST_LOGIN }
]
