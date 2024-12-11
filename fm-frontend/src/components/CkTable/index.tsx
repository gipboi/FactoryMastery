/* eslint-disable max-lines */
import { Fragment, ReactNode, useMemo } from "react";
import {
  CloseIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  UpDownIcon,
} from "@chakra-ui/icons";
import { Table, Thead, Tbody, Tr, Th, Td, Box, Stack } from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import get from "lodash/get";
import { observer } from "mobx-react-lite";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useExpanded,
  useSortBy,
  Column,
  PluginHook,
} from "react-table";
import { ITheme } from "interfaces/theme";
import routes from "routes";
import { ExpandableCellProps } from "./components/ExpandableCell";
import CkPagination from "../CkPagination";
import { ReactComponent as ExpandRowIcon } from "assets/icons/expand_row.svg";
import { ReactComponent as CollapseRowIcon } from "assets/icons/collapse_row.svg";

export interface IPagination {
  tableLength: number;
  pageIndex: number;
  gotoPage: (pageIndex: number) => void;
}

interface ITableProps {
  tableData: any;
  headerList: ITableHeader[];
  subComponent?: any;
  pagination?: IPagination;
  hasNoSort?: boolean;
  columnWidth?: number;
  isManualSort?: boolean;
  pageSize?: number;
  includePagination?: boolean;
  setPageSize?: (page: number) => void;
  hideHeader?: boolean;
  bodyClass?: string;
  setSort?: (name: string) => void;
  setOrderBy?: (orderBy: number) => void;
  spacingX?: number;
  hidePagination?: boolean;
}

export declare interface ITableHeader {
  Header: any;
  accessor?: string;
  Cell?: (props: ExpandableCellProps) => ReactNode;
  columns?: ITableHeader[];
  align?: EAlignEnum;
  disableSortBy?: boolean;
  width?: number | string;
  minWidth?: string;
  isSearchItem?: boolean;
}

export enum EAlignEnum {
  LEFT = "left",
  RIGHT = "right",
  CENTER = "center",
}

const CkTable = (props: ITableProps) => {
  const {
    tableData,
    headerList,
    pagination = { pageIndex: 1, tableLength: 0, gotoPage: () => {} },
    hasNoSort,
    pageSize,
    setPageSize,
    subComponent,
    includePagination = true,
    hideHeader,
    bodyClass = "tbody",
    isManualSort,
    setSort,
    setOrderBy,
    spacingX,
    hidePagination,
  } = props;
  const columns: Column<object>[] = (useMemo(() => headerList, [headerList]) ||
    []) as Column<object>[];
  const navigate = useNavigate();
  // const { spinnerStore, organizationStore, collectionStore } = useStores();
  const { spinnerStore } = useStores();
  const { isLoading } = spinnerStore;
  const isEmptyTable: boolean = tableData?.length === 0;
  // const { organization } = organizationStore;
  // const currentTheme: ITheme = organization?.theme ?? {};
  const currentTheme: ITheme = {};
  // TODO: Integrate later
  const sortBy = useMemo(
    () =>
      isManualSort ? [] : [{ id: headerList[0]?.accessor ?? "", desc: false }],
    [isManualSort]
  );
  const tablePlugins: Array<PluginHook<object>> = [];
  if (!hasNoSort) {
    tablePlugins.push(useSortBy);
  }
  tablePlugins.push(useExpanded);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
  } = useTable(
    {
      columns,
      data: tableData,
      // @ts-ignore //* INFO: react-table-v7 missing this prop interface
      initialState: { sortBy },
      autoResetSortBy: !isManualSort,
      disableSortRemove: isManualSort,
      manualSortBy: isManualSort,
    },
    ...tablePlugins
  );
  const paginationComponent =
    includePagination && pageSize && setPageSize && !isEmptyTable ? (
      <CkPagination
        pagination={pagination}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    ) : null;

  return (
    <Stack spacing="24px" width="full">
      <Box
        padding={0}
        overflow="auto"
        width="100%"
        css={{
          "&::-webkit-scrollbar, &::-webkit-scrollbar-thumb": {
            height: "26px",
            borderRadius: "13px",
            backgroundClip: "padding-box",
            border: "10px solid transparent",
          },
        }}
      >
        <Table
          {...getTableProps()}
          variant="simple"
          width="full"
          color="gray.600"
          fontWeight={600}
          fontSize="16px"
          lineHeight="24px"
        >
          <Thead
            display={hideHeader ? "none" : "table-header-group"}
            className="thead"
          >
            {headerGroups.map((headerGroup: any) => {
              const { key, ...restHeaderGroup } =
                headerGroup.getHeaderGroupProps();
              return (
                <Tr
                  key={`tr-${key}`}
                  {...restHeaderGroup}
                  background="gray.50"
                  _hover={{
                    background: "white",
                  }}
                >
                  {headerGroup.headers.map((column: Record<string, any>) => {
                    if (isManualSort && column?.isSorted) {
                      setSort && setSort(column?.id);
                      setOrderBy && setOrderBy(column.isSortedDesc ? -1 : 1);
                    }
                    const align: EAlignEnum =
                      get(column, "align", EAlignEnum.LEFT) || EAlignEnum.LEFT;
                    const { key: colKey, ...colProps } = column.getHeaderProps(
                      column?.Header ? column.getSortByToggleProps : undefined
                    );
                    const width =
                      column?.width && Math.floor(column?.width / 4) > 0
                        ? `${Math.floor(column?.width / 4)}`
                        : "auto";
                    return (
                      <Th
                        key={`th-${colKey}`}
                        {...colProps}
                        whiteSpace="nowrap"
                        paddingY="4"
                        paddingX={spacingX}
                        fontWeight={600}
                        fontSize="16px"
                        lineHeight="24px"
                        textAlign={align}
                        textTransform="capitalize"
                        width={width}
                        letterSpacing="normal"
                        minWidth={column?.minWidth}
                      >
                        {column.render("Header")}
                        &nbsp;
                        {hasNoSort || column?.disableSortBy ? (
                          ""
                        ) : (
                          <span>
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <TriangleDownIcon width={2} height={2} />
                              ) : (
                                <TriangleUpIcon width={2} height={2} />
                              )
                            ) : column.Header ? (
                              <UpDownIcon width={2} height={2} />
                            ) : null}
                          </span>
                        )}
                      </Th>
                    );
                  })}
                </Tr>
              );
            })}
          </Thead>
          <Tbody
            {...getTableBodyProps()}
            color="gray.700"
            fontWeight="500"
            fontSize="16px"
            className={bodyClass}
          >
            {!isLoading &&
              rows.map((row: any, index: number) => {
                prepareRow(row);
                const isExpanded = get(row, "isExpanded", false);
                const isBold: boolean = get(row, "original.isBold", false);
                const isHightLight: boolean | undefined = get(
                  row,
                  "original.isHightLight"
                );
                const backGroundColor: string = isHightLight
                  ? "#E6FFFA !important"
                  : "unset !important";
                const correlatingId =
                  get(row, "original.correlatingId", "") ||
                  get(row, "original.id", "");
                const collectionName = get(row, "original.collectionName", "");
                const isProcess: boolean = !(
                  // collectionName === EEsGlobalSearchCollection.COLLECTION
                  (collectionName === "collection")
                );
                return (
                  <Fragment key={`row-${index}`}>
                    <Tr height={3}></Tr>
                    <Tr
                      {...row.getRowProps()}
                      className={isExpanded ? "expanded" : "normal"}
                      fontWeight={isBold ? "bold" : "500"}
                      backgroundColor={
                        isHightLight !== undefined ? backGroundColor : undefined
                      }
                      marginBottom={isHightLight ? 4 : 0}
                      display={isLoading ? "none" : "table-row"}
                      background="gray.50"
                      _hover={{ background: "white" }}
                      padding="12px 16px"
                      boxShadow="sm"
                      cursor="pointer"
                      borderRightRadius="8px"
                    >
                      {row.cells.map((cell: any, index: number) => {
                        const { key, ...restCell } = cell.getCellProps();
                        const align: EAlignEnum =
                          get(cell, "column.align", EAlignEnum.LEFT) ||
                          EAlignEnum.LEFT;
                        const isExpandCell = cell.column.id === "isExpand";
                        const excludedColumns = [
                          "checkbox",
                          "archivedAt",
                          "updatedAt",
                        ];
                        const isExcluded = excludedColumns.includes(
                          cell.column.id
                        );
                        const isActionsCell = cell.column.id === "actions";

                        if (isExpandCell) {
                          return (
                            <Td
                              {...restCell}
                              key={key}
                              borderBottomWidth="0"
                              width="48px"
                              paddingX={spacingX ?? "14px"}
                              className="expand-icon"
                            >
                              {isExpanded ? (
                                <ExpandRowIcon
                                  width={20}
                                  height={20}
                                  {...row.getToggleRowExpandedProps()}
                                />
                              ) : (
                                <CollapseRowIcon width={20} height={20} />
                              )}
                            </Td>
                          );
                        }
                        return (
                          <Td
                            {...restCell}
                            key={key}
                            borderBottomWidth="0"
                            textAlign={align}
                            paddingX={spacingX}
                            paddingLeft={isActionsCell ? 0 : undefined}
                            width={isActionsCell ? 0 : undefined}
                            _hover={
                              collectionName && !isExcluded
                                ? {
                                    color:
                                      collectionName && correlatingId
                                        ? currentTheme?.primaryColor ??
                                          "primary.500"
                                        : undefined,
                                    transition: "all 250ms",
                                  }
                                : undefined
                            }
                            onClick={() => {
                              if (
                                isExcluded ||
                                isActionsCell ||
                                !collectionName
                              ) {
                                return;
                              }
                              if (correlatingId) {
                                if (isProcess) {
                                  navigate(
                                    routes.processes.processId.value(
                                      String(correlatingId)
                                    )
                                  );
                                } else {
                                  // collectionStore.setIsManagePermission(false);
                                  navigate(
                                    routes.collections.collectionId.value(
                                      String(correlatingId)
                                    )
                                  );
                                }
                              }
                            }}
                          >
                            {cell.render("Cell")}
                          </Td>
                        );
                      })}
                    </Tr>
                    {isHightLight && isBold && (
                      <Tr>
                        <Td padding={2}></Td>
                      </Tr>
                    )}
                    {subComponent &&
                      (get(row, "isExpanded", false) ? (
                        <Tr background="teal.50">
                          <Td
                            colSpan={visibleColumns.length}
                            borderBottomWidth="0"
                            paddingTop="0px !important"
                            paddingBottom="16px !important"
                          >
                            {subComponent(row)}
                          </Td>
                        </Tr>
                      ) : (
                        <Tr display="none"></Tr>
                      ))}
                  </Fragment>
                );
              })}
            {isLoading &&
              Array.from({ length: pageSize || 8 }).map((_, index) => (
                <Fragment key={`skeleton-${index}`}>
                  <Tr height={3}></Tr>
                  <Tr>
                    <Td
                      colSpan={visibleColumns.length}
                      borderBottomWidth="0"
                      padding="0"
                    >
                      <Skeleton height="64px" />
                    </Td>
                  </Tr>
                </Fragment>
              ))}
          </Tbody>
        </Table>
      </Box>
      {!hidePagination && paginationComponent}
    </Stack>
  );
};

export default observer(CkTable);
