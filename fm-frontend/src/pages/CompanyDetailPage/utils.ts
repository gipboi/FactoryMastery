import dayjs from 'dayjs'
import { ICompanyDetail } from 'constants/report'
import { ELicenseType, filterLicenseOptions } from 'constants/report/license'
import { ICompanyReportForm } from './constants'

export function getCompanyReportFormData(data: ICompanyDetail): ICompanyReportForm {
  return {
    license: filterLicenseOptions(data?.license ?? ELicenseType.FREE),
    lastLogin: data?.lastSignInAt ? dayjs(data?.lastSignInAt).format('MM/DD/YYYY') : '',
    totalLogin: data?.totalLogin,
    totalUser: data?.totalUser,
    totalProcess: data?.totalProcess,
    totalCollection: data?.totalCollection,
    totalView: data?.totalView,
    totalEdit: data?.totalEdit,
    updatedAt: data?.updatedAt ? dayjs(data?.updatedAt).format('MM/DD/YYYY HH:mm:ss') : '',
    expiredAt: data?.trialExpirationDate ? dayjs(data?.trialExpirationDate).format('MM/DD/YYYY HH:mm:ss') : '',
    isThemeSetting: data?.isThemeSetting ?? false,
    isModularProcess: data?.isModularProcess ?? false,
    isReportTool: data?.isReportTool ?? false,
    isCollectionFeature: data?.isCollectionFeature ?? false,
    isStandardUserCanAccessUser: data?.isStandardUserCanAccessUser ?? false,
    isMarketPlace: data?.isMarketPlace ?? false
  }
}
