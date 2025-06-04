import React from 'react'
import { Box } from '@chakra-ui/react'
import cx from 'classnames'
import { AuthRoleNameEnum } from 'constants/user'
import styles from './styles.module.scss'

interface IUserTypeTagProps {
  role: AuthRoleNameEnum
  disabled?: boolean
}

function UserTypeTag(props: IUserTypeTagProps) {
  const { role, disabled = false } = props
  return (
    <Box
      className={cx(styles.tag, {
        [styles.basisUser]: role === AuthRoleNameEnum.BASIC_USER,
        [styles.admin]: role === AuthRoleNameEnum.MANAGER,
        [styles.orgAdmin]: role === AuthRoleNameEnum.ORG_ADMIN,
        [styles.spAdmin]: role === AuthRoleNameEnum.SUPER_ADMIN,
        [styles.disabled]: disabled
      })}
      width="fit-content"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {role}
    </Box>
  )
}

export default UserTypeTag
