import { FormControl, FormLabel, Switch } from '@chakra-ui/react'
import { useFormContext, useWatch } from 'react-hook-form'

interface IFormSwitchProps {
  label: string
  name: string
  setValue: (name: string, value: boolean) => void
}

const FormSwitch = (props: IFormSwitchProps) => {
  const { label, name, setValue } = props
  const { control } = useFormContext()
  const isChecked: boolean = useWatch({ name, control })

  return (
    <FormControl display="flex" justifyContent="space-between">
      <FormLabel color="gray.700" fontSize="14px" fontWeight={500} lineHeight={5}>
        {label}
      </FormLabel>
      <Switch isChecked={isChecked} onChange={event => setValue(name, event?.target?.checked)} colorScheme="primary" />
    </FormControl>
  )
}

export default FormSwitch
