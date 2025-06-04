/* eslint-disable max-lines */
import { Fragment, useMemo } from 'react'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { Table, Thead, Tbody, Tr, Th, Td, Box, Stack } from '@chakra-ui/react'
import { useStores } from 'hooks/useStores'
import get from 'lodash/get'
import { observer } from 'mobx-react-lite'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import { useTable, useExpanded, useSortBy, Column, PluginHook } from 'react-table'
import { EAlignEnum, IPagination, ITableHeader } from 'components/CkTable'
import SvgIcon from 'components/SvgIcon'
import { ITheme } from 'interfaces/theme'
import routes from 'routes'
import CkPagination from '../CkPagination'
import 'react-loading-skeleton/dist/skeleton.css'

interface ITableProps {
  tableData: any
  headerList: ITableHeader[]
  subComponent?: any
  pagination?: IPagination
  hasNoSort?: boolean
  columnWidth?: number
  isManualSort?: boolean
  pageSize?: number
  includePagination?: boolean
  setPageSize?: (page: number) => void
  hideHeader?: boolean
  bodyClass?: string
  setSort?: (name: string) => void
  setOrderBy?: (orderBy: number) => void
  spacingX?: number
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
    bodyClass = 'tbody',
    isManualSort,
    setSort,
    setOrderBy,
    spacingX
  } = props
  const columns: any = useMemo(() => headerList, [headerList]) || []
  const navigate = useNavigate()
  const { spinnerStore, organizationStore } = useStores()
  const { isLoading } = spinnerStore
  const isEmptyTable: boolean = tableData?.length === 0
  const { organization } = organizationStore
  const currentTheme: ITheme = organization?.theme ?? {}
  // TODO: Integrate later
  // const sortBy = useMemo(() => (isManualSort ? [] : [{ id: headerList[0]?.accessor ?? '', desc: false }]), [
  //   isManualSort
  // ])
  const tablePlugins: Array<PluginHook<object>> = []
  if (!hasNoSort) {
    tablePlugins.push(useSortBy)
  }
  tablePlugins.push(useExpanded)
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, visibleColumns } = useTable(
    {
      columns,
      data: tableData
      // TODO: Integrate later
      // initialState: {
      //   sortBy
      // },
      // autoResetSortBy: !isManualSort,
      // disableSortRemove: isManualSort,
      // manualSortBy: isManualSort
    },
    ...tablePlugins
  )
  const paginationComponent =
    includePagination && pageSize && setPageSize && !isEmptyTable ? (
      <CkPagination pagination={pagination} pageSize={pageSize} setPageSize={setPageSize} />
    ) : null

  return (
    <Stack spacing="24px" width="full">
      <Box
        padding={0}
        overflow="auto"
        width="100%"
        borderBottomRadius={16}
        css={{
          '&::-webkit-scrollbar, &::-webkit-scrollbar-thumb': {
            height: '26px',
            borderRadius: '13px',
            backgroundClip: 'padding-box',
            border: '10px solid transparent'
          }
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
          <Thead display={hideHeader ? 'none' : 'table-header-group'} className="thead">
            {headerGroups.map(headerGroup => {
              const { key, ...restHeaderGroup } = headerGroup.getHeaderGroupProps()
              return (
                <Tr
                  key={`tr-${key}`}
                  {...restHeaderGroup}
                  background="white"
                  _hover={{
                    background: 'gray.50'
                  }}
                >
                  {headerGroup.headers.map((column: Record<string, any>) => {
                    if (isManualSort && column?.isSorted) {
                      setSort && setSort(column?.id)
                      setOrderBy && setOrderBy(column.isSortedDesc ? -1 : 1)
                    }
                    const align: EAlignEnum = get(column, 'align', EAlignEnum.LEFT) || EAlignEnum.LEFT
                    const { key: colKey, ...colProps } = column.getHeaderProps(
                      column?.Header ? column.getSortByToggleProps : undefined
                    )
                    const width =
                      column?.width && Math.floor(column?.width / 4) > 0 ? `${Math.floor(column?.width / 4)}` : 'auto'
                    return (
                      <Th
                        key={`th-${colKey}`}
                        {...colProps}
                        whiteSpace="nowrap"
                        paddingY={4}
                        paddingX={spacingX}
                        color="gray.700"
                        fontWeight={700}
                        fontSize="12px"
                        lineHeight="24px"
                        textAlign={align}
                        textTransform="uppercase"
                        width={width}
                        letterSpacing="normal"
                        borderBottomWidth="0"
                        minWidth={column?.minWidth}
                      >
                        {column.render('Header')}
                        &nbsp;
                        {hasNoSort || column?.disableSortBy ? (
                          ''
                        ) : (
                          <span>
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <TriangleDownIcon width={2} height={2} />
                              ) : (
                                <TriangleUpIcon width={2} height={2} />
                              )
                            ) : column.Header ? (
                              <SvgIcon iconName="three-lines" size={12} />
                            ) : null}
                          </span>
                        )}
                      </Th>
                    )
                  })}
                </Tr>
              )
            })}
          </Thead>
          <Tbody {...getTableBodyProps()} color="gray.700" fontWeight="500" fontSize="16px" className={bodyClass}>
            {!isLoading &&
              rows.map((row, index: number) => {
                prepareRow(row)
                const isExpanded = get(row, 'isExpanded', false)
                const isBold: boolean = get(row, 'original.isBold', false)
                const isHightLight: boolean | undefined = get(row, 'original.isHightLight')
                const backGroundColor: string = isHightLight ? '#E6FFFA !important' : 'unset !important'
                const correlatingId = get(row, 'original.correlatingId', '') || get(row, 'original.id', '')
                const collectionName: string = get(row, 'original.collectionName', '')
                const isProcess: boolean = !(collectionName === "collection")
                return (
                  <Fragment key={`row-${index}`}>
                    <Tr
                      {...row.getRowProps()}
                      className={isExpanded ? 'expanded' : 'normal'}
                      fontWeight={isBold ? 'bold' : '400'}
                      backgroundColor={isHightLight !== undefined ? backGroundColor : undefined}
                      marginBottom={isHightLight ? 4 : 0}
                      display={isLoading ? 'none' : 'table-row'}
                      background="white"
                      _hover={{ background: 'gray.50' }}
                      padding="12px 16px"
                      boxShadow="sm"
                      cursor="pointer"
                      borderRightRadius="8px"
                      fontSize="14px"
                    >
                      {row.cells.map(cell => {
                        const { key, ...restCell } = cell.getCellProps()
                        const align: EAlignEnum = get(cell, 'column.align', EAlignEnum.LEFT) || EAlignEnum.LEFT
                        const isExpandCell = cell.column.id === 'isExpand'
                        const excludedColumns = ['checkbox', 'archivedAt', 'updatedAt']
                        const isExcluded = excludedColumns.includes(cell.column.id)
                        const isActionsCell = cell.column.id === 'actions'

                        if (isExpandCell) {
                          return (
                            <Td
                              {...restCell}
                              key={key}
                              borderBottomWidth="0"
                              width="48px"
                              paddingX={spacingX ?? '14px'}
                              className="expand-icon"
                            >
                              <SvgIcon
                                iconName={isExpanded ? 'expand_row' : 'collapse_row'}
                                size={20}
                                // @ts-ignore //* INFO: react-table-v6 missing this prop interface
                                {...row.getToggleRowExpandedProps()}
                              />
                            </Td>
                          )
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
                                        ? (currentTheme?.primaryColor ?? 'primary.500')
                                        : undefined,
                                    transition: 'all 250ms'
                                  }
                                : undefined
                            }
                            onClick={() => {
                              if (isExcluded || isActionsCell || !collectionName) {
                                return
                              }
                              if (correlatingId) {
                                isProcess
                                  ? navigate(routes.processes.processId.value(String(correlatingId)))
                                  : navigate(routes.collections.collectionId.value(String(correlatingId)))
                              }
                            }}
                          >
                            {cell.render('Cell') as React.ReactNode}
                          </Td>
                        )
                      })}
                    </Tr>
                    {isHightLight && isBold && (
                      <Tr>
                        <Td padding={2}></Td>
                      </Tr>
                    )}
                    {subComponent &&
                      (get(row, 'isExpanded', false) ? (
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
                )
              })}
            {isLoading &&
              Array.from({ length: pageSize || 8 }).map((_, index) => (
                <Fragment key={`skeleton-${index}`}>
                  <Tr margin={0}>
                    <Td colSpan={visibleColumns.length} borderBottomWidth="0" padding="0">
                      <Skeleton height="64px" />
                    </Td>
                  </Tr>
                </Fragment>
              ))}
          </Tbody>
        </Table>
      </Box>
      {paginationComponent}
    </Stack>
  )
}

export default observer(CkTable)
