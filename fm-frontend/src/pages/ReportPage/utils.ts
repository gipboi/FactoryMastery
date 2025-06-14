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

export const companyOverviewMockData = [
  {
    company: 'Company 1',
    license: 'free',
    lastLogin: '10/09/2023',
    totalLogins: 10,
    user: 100,
    process: 100,
    collection: 100,
    view: 100,
    edit: 100
  },
  {
    company: 'Company 2',
    license: 'enterprise',
    lastLogin: '10/09/2023',
    totalLogins: 20,
    user: 200,
    process: 200,
    collection: 200,
    view: 200,
    edit: 200
  },
  {
    company: 'Altec Organization',
    license: 'paid',
    lastLogin: '10/09/2023',
    totalLogins: 30,
    user: 300,
    process: 300,
    collection: 300,
    view: 300,
    edit: 300
  },
  {
    company: 'Company 4',
    license: 'enterprise',
    lastLogin: '10/09/2023',
    totalLogins: 40,
    user: 400,
    process: 400,
    collection: 400,
    view: 400,
    edit: 400
  },
  {
    company: 'Company 5',
    license: 'paid',
    lastLogin: '10/09/2023',
    totalLogins: 50,
    user: 500,
    process: 500,
    collection: 500,
    view: 500,
    edit: 500
  },
  {
    company: 'Company 6',
    license: 'enterprise',
    lastLogin: '10/09/2023',
    totalLogins: 60,
    user: 600,
    process: 600,
    collection: 600,
    view: 600,
    edit: 600
  },
  {
    company: 'Company 7',
    license: 'paid',
    lastLogin: '10/09/2023',
    totalLogins: 70,
    user: 700,
    process: 700,
    collection: 700,
    view: 700,
    edit: 700
  },
  {
    company: 'Company 8',
    license: 'paid',
    lastLogin: '10/09/2023',
    totalLogins: 80,
    user: 800,
    process: 800,
    collection: 800,
    view: 800,
    edit: 800
  },
  {
    company: 'Company 9',
    license: 'enterprise',
    lastLogin: '10/09/2023',
    totalLogins: 90,
    user: 900,
    process: 900,
    collection: 900,
    view: 900,
    edit: 900
  },
  {
    company: 'Company 10',
    license: 'free',
    lastLogin: '10/09/2023',
    totalLogins: 100,
    user: 1000,
    process: 1000,
    collection: 1000,
    view: 1000,
    edit: 1000
  }
]
