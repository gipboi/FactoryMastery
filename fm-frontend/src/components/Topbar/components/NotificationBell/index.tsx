import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  chakra,
} from '@chakra-ui/react';
import { seenNotification } from 'API/notification';
import cx from 'classnames';
import SvgIcon from 'components/SvgIcon';
import { NotificationTypeEnum } from 'config/constant/enums/notification';
import { EBreakPoint } from 'constants/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import routes from 'routes';
import colors from 'themes/colors.theme';
import CommentNotification from './components/CommentNofication';
import DeleteCommonStepNotification from './components/DeleteCommonStepNotification';
import UpdateCommonStepNotification from './components/UpdateCommonStepNotification';
import styles from './styles.module.scss';
import CommonNotification from './components/CommonNotification';
dayjs.extend(relativeTime);

function NotificationBell() {
  const { notificationStore, authStore } = useStores();
  const {
    notificationBells: notifications,
    countNotSeenNotificationBells: countNotSeenNotifications = 0,
  } = notificationStore;
  const page = 0;
  const pageSize = 10;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  function fetchData() {
    notificationStore.fetchNotificationBells({
      where: {
        userId: authStore?.userDetail?.id,
        $or: [
          { type: NotificationTypeEnum.COMMENT_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.DELETED_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION },
          { type: NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION },
          { type: NotificationTypeEnum.ARCHIVED_PROCESS_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_THREAD_STATUS },
          { type: NotificationTypeEnum.UPDATED_THREAD_PRIORITY },
        ],
      },
      include: [
        { relation: 'process' },
        { relation: 'author' },
        { relation: 'step' },
      ],
      limit: pageSize,
      skip: page * pageSize,
      order: 'createdAt DESC',
    });
  }

  useEffect(() => {
    if (authStore?.userDetail?.id) {
      fetchData();
    }
  }, [authStore?.userDetail?.id]);

  return (
    <div className={styles.container}>
      <Menu>
        {({ onClose }) => (
          <>
            {countNotSeenNotifications > 0 && (
              <div className={styles.notificationCount}>
                {countNotSeenNotifications}
              </div>
            )}
            <MenuButton
              as={IconButton}
              onClick={fetchData}
              aria-label="Notifications"
              background="transparent"
              _hover={{ background: 'transparent' }}
              _active={{ background: 'transparent' }}
              border="none"
              icon={
                <SvgIcon
                  iconName="notification-bell"
                  size={isMobile ? 24 : 20}
                />
              }
              variant="outline"
            />

            <MenuList className={styles.menu}>
              <HStack
                className={styles.header}
                justifyContent="space-between"
                padding="12px 16px"
                borderBottom="1px solid #E2E8F0"
              >
                <div className={styles.title}>Notifications</div>

                <HStack spacing={4}>
                  <chakra.div
                    onClick={() => {
                      navigate(routes.notifications.value);
                      onClose();
                    }}
                    className={styles.mark}
                    color="var(--current-primary-color)"
                    _hover={{
                      color: 'var(--current-primary-color)',
                      opacity: 0.8,
                    }}
                  >
                    See all
                  </chakra.div>
                  <chakra.div
                    onClick={async () => {
                      await notificationStore.seenAllNotifications();
                      toast.success('Marked all as read');
                      fetchData();
                    }}
                    className={styles.mark}
                    color="var(--current-primary-color)"
                    _hover={{
                      color: 'var(--current-primary-color)',
                      opacity: 0.8,
                    }}
                  >
                    Mark all as read
                  </chakra.div>
                </HStack>
              </HStack>
              <div className={styles.listNotifications}>
                {notifications.map((notification, index) => (
                  <MenuItem
                    key={index}
                    background="transparent"
                    border="none"
                    _hover={{ background: colors.primary[50] }}
                    className={cx({ [styles.unseen]: !notification.isSeen })}
                  >
                    <HStack
                      className={cx(styles.notificationItem)}
                      key={notification.id}
                      onClick={(e) => {
                        e.preventDefault();
                        seenNotification(notification?.id ?? '');

                        navigate(routes.notifications.value);
                      }}
                    >
                      <HStack className={styles.notificationContent}>
                        {notification?.type ===
                          NotificationTypeEnum.COMMENT_STEP_NOTIFICATION && (
                          <CommentNotification notification={notification} />
                        )}

                        {[
                          NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
                          NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION,
                        ].includes(
                          notification?.type as NotificationTypeEnum
                        ) && (
                          <UpdateCommonStepNotification
                            notification={notification}
                          />
                        )}

                        {[
                          NotificationTypeEnum.DELETED_STEP_NOTIFICATION,
                          NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION,
                          NotificationTypeEnum.ARCHIVED_PROCESS_NOTIFICATION,
                        ].includes(
                          notification?.type as NotificationTypeEnum
                        ) && (
                          <DeleteCommonStepNotification
                            notification={notification}
                          />
                        )}

                        {![
                          NotificationTypeEnum.COMMENT_STEP_NOTIFICATION,
                          NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
                          NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION,
                          NotificationTypeEnum.DELETED_STEP_NOTIFICATION,
                          NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION,
                          NotificationTypeEnum.ARCHIVED_PROCESS_NOTIFICATION,
                        ].includes(
                          notification?.type as NotificationTypeEnum
                        ) && <CommonNotification notification={notification} />}
                      </HStack>
                      <HStack>
                        <span className={styles.timestamp}>
                          {dayjs(notification?.createdAt).fromNow(true)}
                        </span>
                      </HStack>
                    </HStack>
                  </MenuItem>
                ))}
              </div>
            </MenuList>
          </>
        )}
      </Menu>
    </div>
  );
}

export default observer(NotificationBell);
