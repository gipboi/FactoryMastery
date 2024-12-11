import { useEffect } from 'react'
import { useStores } from 'hooks/useStores'
import { IFilter } from 'types/common'
import { INotificationWithRelations } from 'interfaces/notification'
import styles from './styles.module.scss'
import NotificationHeader from './NotificationHeader'
import NotificationList from './NotificationList'
import { NotificationTypeEnum } from 'config/constant/enums/notification'

const NotificationPage = () => {
  const { notificationStore, authStore } = useStores()
  const page = 0
  const pageSize = 10

  useEffect(() => {
    const filter: IFilter<INotificationWithRelations> = {
      where: {
        userId: authStore?.userDetail?.id,
        $or: [
          { type: NotificationTypeEnum.COMMENT_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.DELETED_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION },
          { type: NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION },
        ]
      },
      include: [{ relation: 'process' }, { relation: 'author' }, { relation: 'step' }],
      limit: pageSize,
      skip: page * pageSize,
      order: 'createdAt DESC'
    }
    notificationStore.setListFilter(filter)
    if (authStore?.userDetail?.id) {
      notificationStore.fetchNotifications()
      notificationStore.aggregateCountNotifications()
    }
  }, [authStore?.userDetail?.id])

  return (
    <div className={styles.container}>
      <NotificationHeader />
      <NotificationList />
    </div>
  )
}

export default NotificationPage
