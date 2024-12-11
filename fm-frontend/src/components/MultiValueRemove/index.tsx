import { MdCancel as CancelRoundedIcon } from 'react-icons/md'
import { components } from 'react-select'
import styles from './styles.module.scss'

//INFO: <components.DropdownIndicator implement an interface as any, using props here is unnecessary
const MultiValueRemove = (props: any) => {
  return (
    <components.MultiValueRemove {...props}>
      <CancelRoundedIcon height={13} width={13} className={styles.icon} />
    </components.MultiValueRemove>
  )
}

export default MultiValueRemove
