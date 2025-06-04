import { ICollection } from "interfaces/collection";

import { ViewMode } from "./constants";

export interface CollectionsGridItemProps {
  collection: ICollection;
  isManageMode: boolean;
  isSelected: boolean;
  openShareModal: () => void;
  handleSelectItem: () => void;
  onClick?: React.EventHandler<any>;
}
export interface CollectionListProps {
  items: Array<ICollection>;
  onItemClick?: React.EventHandler<any>;
  viewMode?: ViewMode;
  selectedId?: string;
  gotoPage: (page: number) => void;
  isDraft?: boolean;
  isManageMode: boolean;
  pageSize: number;
  sort?: string;
}
