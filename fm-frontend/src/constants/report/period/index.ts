import capitalize from 'lodash/capitalize'
import { IDropdown } from 'types/common'

export enum EPeriod {
  DAY = 'today',
  THIS_WEEK = 'this week',
  LAST_WEEK = 'last week',
  THIS_MONTH = 'this month',
  LAST_MONTH = 'last month',
  YEAR_TO_DATE = 'year To Date',
  LAST_YEAR = 'last year',
  ALL_TIME = 'all time',
  CUSTOM = 'custom'
}

export const periodOptions: IDropdown[] = Object.values(EPeriod).map((period: string) => ({
  value: period,
  title: capitalize(period)
}))

export function filterPeriodOptions(period: string): IDropdown {
  return periodOptions.filter((option: IDropdown) => period === option?.value)[0]
}
