import { ReactNode } from 'react'
import {
  FormControl,
  FormLabel,
  Input,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  FormErrorMessage
} from '@chakra-ui/react'
import get from 'lodash/get'
import startCase from 'lodash/startCase'
import { Controller, useFormContext } from 'react-hook-form'

export interface IFormItemProps {
  name: string
  label?: string
  type?: string
  placeholder?: string
  isRequired?: boolean
  children?: ReactNode
  helperText?: string
  readonly?: boolean
  disabled?: boolean
  hideLabel?: boolean
  className?: string
  errorClassName?: string
  min?: number
  width?: string
  height?: string
  inputColor?: string
  autoComplete?: string
  hideErrorMessage?: boolean
  maxLength?: number
  rules?: any
  pattern?: {
    value: RegExp
    message: string
  }
}

const FormInput = (props: IFormItemProps) => {
  const {
    name,
    label,
    type = 'text',
    placeholder,
    isRequired = true,
    children,
    readonly,
    disabled,
    hideLabel,
    className,
    errorClassName,
    inputColor,
    min,
    width,
    height,
    autoComplete,
    hideErrorMessage,
    maxLength,
    rules,
    pattern
  } = props

  const {
    register,
    formState: { errors },
    control
  } = useFormContext()

  const disabledProps = disabled
    ? {
        disabled: true,
        background: 'gray.300',
        opacity: '0.7 !important',
        color: 'gray.400',
        variant: 'filled',
        borderColor: 'gray.400'
      }
    : {}

  return (
    <FormControl
      isInvalid={!!get(errors, name, false)}
      alignSelf={!label || hideLabel ? 'flex-end' : undefined}
      className={className}
      width={width}
    >
      <HStack spacing="14px" maxHeight={6} marginBottom={label ? 2 : 0} position="relative">
        {label && !hideLabel && (
          <FormLabel
            fontSize="md"
            color="gray.700"
            lineHeight={6}
            marginBottom={0}
            marginInlineEnd={0}
            minWidth="200px"
          >
            {label}
          </FormLabel>
        )}
      </HStack>
      {children ? (
        children
      ) : type !== 'number' ? (
        <Input
          height={height}
          type={type}
          autoComplete={autoComplete ?? name}
          placeholder={placeholder}
          isReadOnly={readonly}
          color={inputColor}
          maxLength={maxLength}
          {...disabledProps}
          {...register(name, {
            required: isRequired ? `${label ?? startCase(name)} is required` : false,
            pattern: pattern,
            ...rules
          })}
        />
      ) : (
        <Controller
          name={name}
          control={control}
          rules={{ 
            required: isRequired, 
            pattern: pattern,
            ...rules 
          }}
          render={({ field }) => (
            <NumberInput focusBorderColor="teal.500" {...field} min={min}>
              <NumberInputField maxLength={maxLength} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          )}
        />
      )}
      {!hideErrorMessage && (
        <FormErrorMessage className={errorClassName}>{String(get(errors, `${name}.message`, '') || '')}</FormErrorMessage>
      )}
    </FormControl>
  )
}

export default FormInput