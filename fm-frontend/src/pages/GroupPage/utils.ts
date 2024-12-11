import { EAlignEnum, ITableHeader } from 'components/CkTable'

export enum ETableHeader {
  ICON = 'icon',
  NAME = 'name',
  DESCRIPTION = 'description',
  MEMBER_COUNT = 'numberOfMembers',
  COLLECTION_COUNT = 'numberOfCollections',
  ACTIONS = 'actions'
}

export function getHeaderList(): ITableHeader[] {
  const headers: ITableHeader[] = [
    {
      Header: '',
      accessor: ETableHeader.ICON,
      width: 4
    },
    {
      Header: 'Name',
      accessor: ETableHeader.NAME,
      width: '25px'
    },
    {
      Header: 'Description',
      accessor: ETableHeader.DESCRIPTION
    },
    {
      Header: 'Members',
      accessor: ETableHeader.MEMBER_COUNT,
      minWidth: '150px'
    },
    {
      Header: 'Collections',
      accessor: ETableHeader.COLLECTION_COUNT,
      minWidth: '150px'
    },
    {
      Header: '',
      accessor: ETableHeader.ACTIONS,
      align: EAlignEnum.RIGHT
    }
  ]

  return headers
}
