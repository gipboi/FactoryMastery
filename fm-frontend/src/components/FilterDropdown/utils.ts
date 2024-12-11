import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { getName } from "utils/user";

export function getOptionSelect<T extends { id?: string; name?: string }>(
  items: T[]
): IOption<string>[] {
  let itemOptions: IOption<string>[] = [];
  let options: string[] = [];
  getValidArray(items).forEach((item: T) => {
    if (
      !options.includes(String(item?.id ?? "")) &&
      (item?.name || !!getName(item))
    ) {
      options = options.concat(String(item?.id));
      itemOptions = [
        ...itemOptions,
        {
          value: String(item?.id),
          label: item?.name ?? getName(item) ?? "",
        },
      ];
    }
  });
  return itemOptions;
}

export function filterRemainItem<T extends { id?: string; name?: string }>(
  itemList: T[],
  selectedItem: IOption<string>[]
): T[] {
  const item = getValidArray(itemList).filter(
    (group: T) =>
      !getValidArray(selectedItem).find(
        (option: IOption<string>) => option?.value === String(group?.id)
      )
  );

  return item;
}
