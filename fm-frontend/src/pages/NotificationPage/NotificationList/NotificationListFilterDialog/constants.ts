export enum ESortingUserOptions {
  NEWEST = "newest",
  OLDEST = "oldest",
  UN_READ = "unread",
}

export const allSortingUserOptions = [
  { label: "Newest", value: ESortingUserOptions.NEWEST },
  { label: "Oldest", value: ESortingUserOptions.OLDEST },
  { label: "Unread", value: ESortingUserOptions.UN_READ },
];
