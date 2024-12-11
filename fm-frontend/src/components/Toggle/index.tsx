import React from 'react'
import { HStack } from '@chakra-ui/react'
import cx from 'classnames'
import styles from './styles.module.scss'

const Toggle = ({ isOn, handleToggle, title }: { isOn: boolean; handleToggle: () => void; title?: string }) => {
  return (
    <HStack width="full">
      <div className={cx(styles.toggle, { [styles.on]: isOn })} onClick={handleToggle}></div>
      {title && <div>{title}</div>}
    </HStack>
  )
}

export default Toggle
