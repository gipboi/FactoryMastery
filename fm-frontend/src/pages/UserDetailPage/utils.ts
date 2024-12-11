import { EAlignEnum, ITableHeader } from "components/CkTable";
import { GroupMemberPermissionEnum } from "constants/enums/group";

export enum ETableHeader {
  ICON = "icon",
  NAME = "name",
  DESCRIPTION = "description",
  PERMISSION = "permission",
  ACTIONS = "actions",
}

export function getHeaderList(): ITableHeader[] {
  const headers: ITableHeader[] = [
    {
      Header: "",
      accessor: ETableHeader.ICON,
      width: 4,
    },
    {
      Header: "Name",
      accessor: ETableHeader.NAME,
      width: "25px",
    },
    {
      Header: "Description",
      accessor: ETableHeader.DESCRIPTION,
    },
    {
      Header: "Permission",
      accessor: ETableHeader.PERMISSION,
    },
    {
      Header: "",
      accessor: ETableHeader.ACTIONS,
      align: EAlignEnum.RIGHT,
    },
  ];

  return headers;
}

export function mapPermissionIdToText(permission?: string): string {
  switch (permission) {
    case GroupMemberPermissionEnum.EDITOR:
      return "Editor";
    case GroupMemberPermissionEnum.VIEWER:
      return "Viewer";
    default:
      return "Viewer";
  }
}

export function getPermissionTagColor(permission?: string): string {
  switch (permission) {
    case GroupMemberPermissionEnum.EDITOR:
      return "yellow.500";
    case GroupMemberPermissionEnum.VIEWER:
      return "blue.500";
    default:
      return "blue.500";
  }
}

export function getPermissionTagBackground(permission?: string): string {
  switch (permission) {
    case GroupMemberPermissionEnum.EDITOR:
      return "yellow.50";
    case GroupMemberPermissionEnum.VIEWER:
      return "blue.50";
    default:
      return "blue.50";
  }
}

export function getPermissionTagBorder(permission?: string): string {
  switch (permission) {
    case GroupMemberPermissionEnum.EDITOR:
      return "yellow.300";
    case GroupMemberPermissionEnum.VIEWER:
      return "blue.300";
    default:
      return "blue.300";
  }
}
