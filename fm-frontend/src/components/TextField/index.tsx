import { Input, InputProps } from '@chakra-ui/react'
import cx from 'classnames'
import styles from './styles.module.scss'

interface TextFieldProps extends InputProps {
  isOpen?: boolean
  targetHover?: boolean

  type?: 'text' | 'email' | 'password' | 'textarea' | 'number'
  error?: boolean

  className?: string
  name?: string
  autoComplete?: string
}

const TextField = (props: TextFieldProps) => {
  const { className = '', error = false, type = 'text', autoComplete, ...rest } = props
  const classes = [styles.hfTextField, 'form-control']

  if (error) classes.push(styles.errorWrapper)
  return (
    <Input
      type={type}
      className={cx(...classes, className)}
      colorScheme="white"
      background="white"
      fontSize="0.9rem"
      autoComplete={autoComplete ?? (type === 'password' ? 'new-password' : 'off')}
      {...rest}
    />
  )
}
export default TextField
