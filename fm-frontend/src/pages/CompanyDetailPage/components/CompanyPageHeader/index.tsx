import { ChevronLeftIcon } from '@chakra-ui/icons'
import { HStack, Tag, Text } from '@chakra-ui/react'
import { useStores } from 'hooks/useStores'
import capitalize from 'lodash/capitalize'
import { observer } from 'mobx-react'
import { useNavigate } from 'react-router-dom'
import { ELicenseType } from 'constants/report/license'
import { getLicenseTagBackground, getLicenseTagColor } from 'pages/CompanyReportPage/utils'
import routes from 'routes'

const CompanyPageHeader = () => {
  const { reportStore } = useStores()
  const { companyReportDetail } = reportStore
  const navigate = useNavigate()

  return (
    <HStack>
      <ChevronLeftIcon cursor="pointer" onClick={() => navigate(routes.admin.report.value)} />
      <Text>{companyReportDetail?.name}</Text>
      <Tag
        color={getLicenseTagColor(companyReportDetail?.license ?? ELicenseType.FREE)}
        background={getLicenseTagBackground(companyReportDetail?.license ?? ELicenseType.FREE)}
      >
        {capitalize(companyReportDetail?.license ?? ELicenseType.FREE)}
      </Tag>
    </HStack>
  )
}

export default observer(CompanyPageHeader)
