import { IOption } from "types/common";
import { IGroup } from "interfaces/groups";
import { IProcessWithRelations } from "interfaces/process";
import { getValidArray } from "utils/common";
import { IUserCollection, IUserWithRelations } from "interfaces/user";
import { getName } from "utils/user";
import { ICollection } from "interfaces/collection";

export function getUserOptionSelect(
  userList?: IUserWithRelations[]
): IOption<string>[] {
  let userOptions: IOption<string>[] = [];
  let users: string[] = [];
  getValidArray(userList).forEach((user: IUserWithRelations) => {
    const userName: string = getName(user);
    if (!users.includes(String(user?.id ?? "")) && userName) {
      users = users.concat(String(user?.id));
      userOptions = [
        ...userOptions,
        {
          value: String(user?.id),
          label: userName,
        },
      ];
    }
  });
  return userOptions;
}

export function getCollectionOptionSelect(
  collectionList?: ICollection[]
): IOption<string>[] {
  let collectionOptions: IOption<string>[] = [];
  let collections: string[] = [];
  getValidArray(collectionList).forEach((collection: ICollection) => {
    const collectionName: string = collection?.name ?? '';
    if (!collections.includes(String(collection?.id ?? "")) && collectionName) {
      collections = collections.concat(String(collection?.id));
      collectionOptions = [
        ...collectionOptions,
        {
          value: String(collection?.id),
          label: collectionName,
        },
      ];
    }
  });
  return collectionOptions;
}

export function getGroupOptionSelect(groupList?: IGroup[]): IOption<string>[] {
  let groupOptions: IOption<string>[] = [];
  let groups: string[] = [];
  getValidArray(groupList).forEach((group: IGroup) => {
    if (!groups.includes(String(group?.id ?? "")) && group?.name) {
      groups = groups.concat(String(group?.id));
      groupOptions = [
        ...groupOptions,
        {
          value: String(group?.id),
          label: group?.name,
        },
      ];
    }
  });
  return groupOptions;
}

export function getProcessOptionSelect(
  groupList?: IProcessWithRelations[]
): IOption<string>[] {
  let processOptions: IOption<string>[] = [];
  let processes: string[] = [];
  getValidArray(groupList).forEach((process: IProcessWithRelations) => {
    if (!processes.includes(String(process?.id ?? "")) && process?.name) {
      processes = processes.concat(String(process?.id));
      processOptions = [
        ...processOptions,
        {
          value: String(process?.id),
          label: process?.name,
        },
      ];
    }
  });
  return processOptions;
}

export function findValueInArray(
  value: string,
  array: IOption<string>[]
): IOption<string> {
  return (
    getValidArray(array).find(
      (item: IOption<string>) => item?.value === value
    ) ?? ({} as IOption<string>)
  );
}

export function filterValueInArray(
  value: string,
  array: IOption<string>[]
): IOption<string>[] {
  return getValidArray(array).filter(
    (item: IOption<string>) => item?.value !== value
  );
}
