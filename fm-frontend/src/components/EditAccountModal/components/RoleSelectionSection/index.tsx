import { observer } from 'mobx-react'
import { useFormContext } from 'react-hook-form'
import FormDropdownInput from 'components/FormInputs/DropdownInput'
import { roleOptions } from './constants'
import styles from './roleSelectionSection.module.scss'

const RoleSelectionSection = () => {
  const { control } = useFormContext()

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Role</h2>
      <div className={styles.dropdownWrapper}>
        <FormDropdownInput
          controllerProps={{ name: 'authRoleId', control }}
          inputProps={{
            name: 'authRoleId',
            options: roleOptions,
            hasNoSeparator: true,
            className: styles.input,
            isSearchable: false
          }}
        />
      </div>
    </div>
  )
}

export default observer(RoleSelectionSection)
