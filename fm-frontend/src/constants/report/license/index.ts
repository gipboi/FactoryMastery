import capitalize from 'lodash/capitalize'
import { IDropdown } from 'types/common'

export enum ELicenseType {
  FREE = 'free',
  ENTERPRISE = 'enterprise',
  PAID = 'paid'
}

export const licenseOptions: IDropdown[] = Object.values(ELicenseType).map((license: string) => ({
  value: license,
  title: capitalize(license)
}))

export function filterLicenseOptions(license: string): IDropdown {
  return licenseOptions.filter((option: IDropdown) => license === option?.value)[0]
}
