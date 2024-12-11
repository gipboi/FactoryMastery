import { EAlignEnum, ITableHeader } from 'components/CkTable'

export function getHeaderList(): ITableHeader[] {
  const headers: ITableHeader[] = [
    {
      Header: '',
      accessor: 'image',
      width: 20
    },
    {
      Header: 'Collection Name',
      accessor: 'name'
    },
    {
      Header: 'Date Modified',
      accessor: 'updatedAt'
    },
    {
      Header: 'Shared',
      accessor: 'shared'
    },
    {
      Header: '',
      accessor: 'action',
      align: EAlignEnum.RIGHT
    }
  ]
  return headers
}
