import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { getName } from "utils/user";
import { ECollectionFilterName } from "./contants";

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

export function getItemIds(
  params: URLSearchParams,
  collectionName: ECollectionFilterName
): string[] {
  return params.get(collectionName)
    ? params
        .get(collectionName)
        ?.split(",")
        ?.map((id: string) => String(id)) ?? []
    : [];
}

export function filterCurrentItems<T extends { id?: string; name?: string }>(
  params: URLSearchParams,
  collectionName: ECollectionFilterName,
  itemList: T[]
): T[] {
  const itemIds: string[] = getItemIds(params, collectionName);

  const currentItems = getValidArray(itemList).filter((item) =>
    itemIds.includes(item?.id ?? "")
  );
  return currentItems;
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

export function filterSubmitItems(selectedItems: IOption<string>[]): string {
  return selectedItems.map((item) => item?.value).join(",");
}
