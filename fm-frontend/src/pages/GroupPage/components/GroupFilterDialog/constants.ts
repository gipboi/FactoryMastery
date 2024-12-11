export enum ESortingUserOptions {
  NAME = "name",
  NEWEST = "createdAt",
  UPDATED = "updatedAt",
}

export const allSortingUserOptions = [
  { label: "Name", value: ESortingUserOptions.NAME },
  { label: "Newest", value: ESortingUserOptions.NEWEST },
  { label: "Updated", value: ESortingUserOptions.UPDATED },
];
