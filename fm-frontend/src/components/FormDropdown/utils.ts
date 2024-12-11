import { IOption } from "components/CustomInputDropdown/types";
import { getValidArray } from "utils/common";
import { getName } from "utils/user";

export function getOptionSelect<T extends { id?: string; name?: string }>(
  items: T[]
): IOption[] {
  let itemOptions: IOption[] = [];
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

export function getItemIds(params: URLSearchParams, name: string): string[] {
  return params.get(name)
    ? params
        .get(name)
        ?.split(",")
        ?.map((id: string) => String(id)) ?? []
    : [];
}

export function filterCurrentItems<T extends { id?: string; name?: string }>(
  params: URLSearchParams,
  name: string,
  itemList: T[]
): T[] {
  const itemIds: string[] = getItemIds(params, name);
  const currentItems = getValidArray(itemList).filter((item) =>
    itemIds.includes(item?.id ?? "")
  );
  return currentItems;
}

export function filterRemainItem<T extends { id?: string; name?: string }>(
  itemList: T[],
  selectedItems: IOption[]
): T[] {
  const item = getValidArray(itemList).filter(
    (item: T) =>
      !getValidArray(selectedItems).find(
        (option: IOption) => option?.value === String(item?.id)
      )
  );
  return item;
}

export function filterSubmitItems(selectedItems: IOption[]): string {
  return selectedItems.map((item: IOption) => item?.value).join(",");
}
