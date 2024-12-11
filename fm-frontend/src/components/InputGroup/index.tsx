import { Fragment } from 'react'
import cx from 'classnames'
import { CardText } from 'reactstrap'
import TextField from 'components/TextField'
import styles from './styles.module.scss'

interface IInputGroupProps {
  label?: string
  value?: string
  error?: string
  placeholder?: string
  type?: 'text' | 'email' | 'textarea' | 'password'
  onChange?: () => void
  smallSpacing?: boolean
  labelClassName?: string
  name?: string
}

const InputGroup = (props: IInputGroupProps) => {
  const { label, value, onChange, error, placeholder, type = 'text', smallSpacing, labelClassName, name } = props
  return (
    <Fragment>
      {label && (
        <CardText className={cx(labelClassName, { [styles.smallSpacingBottom]: smallSpacing })}>{label}</CardText>
      )}
      <TextField
        name={name}
        className={styles.inputField}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        error={!!error}
      />
      {error && (
        <CardText className={cx(styles.errorText, { [styles.smallSpacingTop]: smallSpacing })}>{error}</CardText>
      )}
    </Fragment>
  )
}

export default InputGroup
