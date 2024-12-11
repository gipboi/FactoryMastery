import React, { ReactNode } from 'react'
import { HStack, Text } from '@chakra-ui/react'
interface IFormViewProps {
  label: string
  value?: string
  children?: ReactNode
}
const ItemProcess = (props: IFormViewProps) => {
  const { label = '', value = '', children } = props

  return (
    <HStack
      padding={2}
      alignItems="flex-start"
      width="100%"
      transition="200ms all"
      _hover={{ backgroundColor: 'gray.50', transition: '200ms all' }}
    >
      <Text fontSize="sm" fontWeight={600} lineHeight={6} color="gray.700" minWidth="180px">
        {label}
      </Text>
      {children && children}
      {!children && (
        <Text fontSize="md" fontWeight={400} lineHeight={6} color="gray.700">
          {value}
        </Text>
      )}
    </HStack>
  )
}

export default ItemProcess
