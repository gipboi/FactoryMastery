import { useEffect } from 'react'
import { useStores } from 'hooks/useStores'
import { Row } from 'reactstrap'
import styles from './styles.module.scss'

const NotificationHeader = () => {
  const { notificationStore } = useStores()
  useEffect(() => {
    // notificationStore.seenAllNotifications()
  }, [])

  return (
    <Row className={styles.header}>
      <h2 className={styles.title}>Notifications</h2>
    </Row>
  )
}

export default NotificationHeader
