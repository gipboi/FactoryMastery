import { IDropdown } from 'types/common/select'

export interface ICompanyReportForm {
  license: IDropdown
  lastLogin: string
  totalLogin: number
  totalUser: number
  totalProcess: number
  totalCollection: number
  totalView: number
  totalEdit: number
  updatedAt: string
  expiredAt: string
  isThemeSetting: boolean
  isModularProcess: boolean
  isReportTool: boolean
  isCollectionFeature: boolean
  isStandardUserCanAccessUser: boolean
  isMarketPlace: boolean
}
