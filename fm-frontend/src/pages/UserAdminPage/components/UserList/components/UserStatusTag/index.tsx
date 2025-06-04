import React from 'react'
import { Box } from '@chakra-ui/react'
import cx from 'classnames'
import { AuthRoleNameEnum } from 'constants/user'
import styles from './styles.module.scss'

interface IUserStatusTagProps {
  deleted?: boolean
  disabled?: boolean
}

function UserStatusTag(props: IUserStatusTagProps) {
  const { disabled = false, deleted = false } = props

  return (
    <Box
      className={cx(styles.tag, {
        [styles.blue]: !disabled && !deleted,
        [styles.deleted]: deleted,
        [styles.disabled]: disabled
      })}
      width="fit-content"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {deleted ? 'Deleted' : disabled ? 'Disabled' : 'Active'}
    </Box>
  )
}

export default UserStatusTag
