import { SimpleGrid, Text } from '@chakra-ui/react'
import { useFormContext, useWatch } from 'react-hook-form'

interface IFormViewProps {
  label: string
  name?: string
  children?: React.ReactNode
}

const FormView = (props: IFormViewProps) => {
  const { label, name = '', children } = props
  const { control } = useFormContext()
  const value: string = useWatch({ name, control })

  return (
    <SimpleGrid width="full" columns={2}>
      <Text color="gray.700" fontSize="14px" fontWeight={600} lineHeight={5}>
        {label}
      </Text>
      {children ? (
        children
      ) : (
        <Text color="gray.700" fontSize="16px" fontWeight={400} lineHeight={6}>
          {value}
        </Text>
      )}
    </SimpleGrid>
  )
}

export default FormView
