import { ELicenseType } from 'constants/report/license'

export function getLicenseTagColor(license: string): string {
  if (license === ELicenseType.FREE) {
    return 'primary.100'
  }
  if (license === ELicenseType.ENTERPRISE) {
    return 'yellow.100'
  }
  if (license === ELicenseType.PAID) {
    return 'green.100'
  }
  return ''
}

export function getLicenseTagBackground(license: string): string {
  if (license === ELicenseType.FREE) {
    return 'primary.500'
  }
  if (license === ELicenseType.ENTERPRISE) {
    return 'yellow.500'
  }
  if (license === ELicenseType.PAID) {
    return 'green.500'
  }
  return ''
}

export function getHeaderList() {
  return [
    {
      Header: 'COMPANY',
      accessor: 'name'
    },
    {
      Header: 'LICENSE',
      accessor: 'license'
    },
    {
      Header: 'LAST LOGIN',
      accessor: 'lastLogin'
    },
    {
      Header: 'TOTAL LOGINS',
      accessor: 'login'
    },
    {
      Header: 'USERS',
      accessor: 'user'
    },
    {
      Header: 'PROCESSES',
      accessor: 'process'
    },
    {
      Header: 'COLLECTIONS',
      accessor: 'collection'
    },
    {
      Header: 'VIEWS',
      accessor: 'view'
    },
    {
      Header: 'EDITS',
      accessor: 'edit'
    }
  ]
}
