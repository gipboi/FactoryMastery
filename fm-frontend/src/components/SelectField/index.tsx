import cx from 'classnames'
import Select from 'react-select'
import styles from './styles.module.scss'

type SelectProps = React.ComponentProps<typeof Select>

const SelectField = ({ className, ...props }: SelectProps) => {
  return <Select classNamePrefix={styles.hfSelectField} className={cx(styles.hfSelectField, className)} {...props} />
}

export default SelectField
