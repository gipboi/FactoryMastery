import { VStack, Text, Img } from '@chakra-ui/react'
import EmptyResultPhoto from '../../../../assets/images/empty-result-2.svg'

export interface IEmptyResultProps {
  title: string
  description: string
}
const EmptyResult = (props: IEmptyResultProps) => {
  const { title, description } = props
  return (
    <VStack paddingTop={4} paddingBottom="88px" spacing={6} justifyContent="center" width="full" alignSelf="center">
      <Img src={EmptyResultPhoto} alt="empty-result" />
      <VStack spacing={4}>
        <Text color="gray.700" fontSize="20px" fontWeight="600" lineHeight="28px" marginBottom="0">
          {title}
        </Text>
        <Text color="gray.700" fontSize="16px" fontWeight="500" lineHeight="24px" textAlign="center" marginBottom="0">
          {description}
        </Text>
      </VStack>
    </VStack>
  )
}

export default EmptyResult
