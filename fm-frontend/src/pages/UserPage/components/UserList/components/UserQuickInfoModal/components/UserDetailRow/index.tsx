import { HStack, Text } from '@chakra-ui/react'

interface UserDetailRowProps {
  label: string
  textContent?: string
  children?: React.ReactNode
}

const UserDetailRow = (props: UserDetailRowProps) => {
  const { label, textContent, children } = props

  return (
    <HStack spacing={6}>
      <Text
        margin={0}
        color="gray.700"
        fontSize="sm"
        fontWeight="600"
        lineHeight={5}
        minWidth="168px"
      >
        {label}
      </Text>
      {textContent ? (
        <Text color="gray.700" fontSize="sm" fontWeight="400" lineHeight={5} >
          {textContent}
        </Text>
      ) : (
        children
      )}
    </HStack>
  )
}
export default UserDetailRow
