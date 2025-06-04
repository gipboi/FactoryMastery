import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { HStack, Text, VStack } from '@chakra-ui/react'
import round from 'lodash/round'
import { EPeriod } from 'constants/report/period'
import { formatPeriod } from 'utils/report'

interface IInfoBoxProps {
  title: string
  value: number
  icon: React.ReactNode
  percent?: number
  period?: string
}

const InfoBox = (props: IInfoBoxProps) => {
  const { title = 'Total Company/Organization', value = 0, icon, percent = 0, period = '' } = props
  const formattedPeriod: string = formatPeriod(period as EPeriod)

  return (
    <HStack
      justifyContent="space-between"
      spacing={6}
      background="white"
      borderRadius="8px"
      boxShadow="md"
      padding={6}
      width={{ base: 'auto', lg: '100%' }}
    >
      <VStack width="100%" spacing={4} alignItems="flex-start">
        <HStack width="100%" justifyContent="space-between">
          <Text marginY={0} color="gray.500" fontSize="14px" fontWeight="700" lineHeight="20px">
            {title}
          </Text>
          {icon}
        </HStack>
        <VStack spacing={4} alignItems="flex-start">
          <Text marginY={0} color="gray.700" fontSize="40px" fontWeight="700" lineHeight="48px">
            {value.toLocaleString('en-US')}
          </Text>
          <HStack>
            <HStack spacing={0} background="green.100" padding="2px 8px" borderRadius="6px">
              {percent < 0 ? (
                <ArrowDownIcon width="20px" height="20px" color={'red.700'} marginRight={1} />
              ) : (
                <ArrowUpIcon width="20px" height="20px" color={'green.700'} marginRight={1} />
              )}
              <Text color={percent < 0 ? 'red.700' : 'green.700'} fontSize="16px" fontWeight="600" lineHeight="120%">
                {Math.abs(round(percent, 2)) ?? 0}%
              </Text>
            </HStack>
            <Text marginTop="4px !important" color="gray.600" fontSize="12px" fontWeight="400" lineHeight="120%">
              {formattedPeriod}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </HStack>
  )
}

export default InfoBox
