import { useEffect } from 'react'
import { useStores } from 'hooks/useStores'
import styles from './styles.module.scss'
import { Box } from '@chakra-ui/react'

const NotificationHeader = () => {
  const { notificationStore } = useStores()
  useEffect(() => {
    // notificationStore.seenAllNotifications()
  }, [])

  return (
    <Box className={styles.header}>
      <h2 className={styles.title}>Notifications</h2>
    </Box>
  )
}

export default NotificationHeader
