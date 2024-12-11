import { Fragment } from 'react'
import * as React from 'react'
import { Search2Icon } from '@chakra-ui/icons'
import { InputGroup, InputLeftElement } from '@chakra-ui/react'
import cx from 'classnames'
import { FallbackFormRegister, FormRegister } from 'types/hookForm'
import TextField from 'components/TextField'
import styles from './styles.module.scss'

interface ISearchInputProps {
  className?: string
  name?: string
  value?: string
  placeholder?: string
  defaultValue?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  innerRef?: FormRegister | FallbackFormRegister | void
  width?: string | number
}

const SearchInput = (props: ISearchInputProps) => {
  const { className, width, value, onChange, placeholder, name, defaultValue } = props
  return (
    <Fragment>
      <InputGroup width={width}>
        <InputLeftElement pointerEvents="none" children={<Search2Icon color="gray.300" />} paddingLeft={3} />
        <TextField
          name={name}
          paddingY="10px"
          paddingLeft={12}
          className={cx(styles.inputField, className)}
          placeholder={placeholder}
          type="text"
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
        />
      </InputGroup>
    </Fragment>
  )
}

export default SearchInput
