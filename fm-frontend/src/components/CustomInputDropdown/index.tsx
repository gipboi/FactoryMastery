import { SearchIcon } from '@chakra-ui/icons'
import { FormControl, InputGroup, FormLabel } from '@chakra-ui/react'
import { Select } from 'chakra-react-select'
import last from 'lodash/last'
import { Controller, useFormContext } from 'react-hook-form'
import { IChakraInputDropdownProps } from './types'

const CustomInputDropdown = (props: IChakraInputDropdownProps) => {
  const { name, label, optionsData, placeholder, chooseOptionsHandler, disabled = false } = props

  const { control } = useFormContext()

  return (
    <FormControl width="full" id={name}>
      <FormLabel color="gray.700" fontWeight="500" lineHeight={6} marginBottom={2}>
        {label}
      </FormLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputGroup borderRadius="6px" width="full" background="white" cursor="pointer" isolation="unset">
            <Select
              {...field}
              value={null}
              onChange={(options: any) => {
                chooseOptionsHandler((last(options) as any)?.value ?? '')
              }}
              isSearchable
              isMulti
              isDisabled={disabled}
              options={optionsData}
              placeholder={placeholder}
              closeMenuOnSelect={true}
              components={{
                IndicatorSeparator: null,
                DropdownIndicator: () => <SearchIcon boxSize={5} color="gray.600" mr={2} />
              }}
              size="md"
              isClearable
              menuShouldBlockScroll
              chakraStyles={{
                container: (provided: Record<string, unknown>) => ({
                  ...provided,
                  width: 'full',
                  cursor: 'pointer'
                }),
                option: (provided: Record<string, unknown>) => ({
                  ...provided,
                  width: 'auto',
                  cursor: 'pointer'
                }),
                dropdownIndicator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  // bg: 'transparent',
                  px: 2,
                  cursor: 'pointer'
                }),
                indicatorSeparator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  display: 'none'
                }),
                clearIndicator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  display: 'none'
                }),
                multiValueRemove: (provided: Record<string, unknown>) => ({
                  ...provided,
                  color: 'gray.700'
                }),
                placeholder: (provided: Record<string, unknown>) => ({
                  ...provided,
                  padding: '0'
                }),
                menu: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999
                }),
                menuList: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999
                }),
                // @ts-expect-error
                menuPortal: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999
                })
              }}
            />
          </InputGroup>
        )}
      />
    </FormControl>
  )
}

export default CustomInputDropdown
