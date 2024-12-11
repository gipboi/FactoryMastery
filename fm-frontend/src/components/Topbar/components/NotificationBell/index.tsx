import { useEffect } from "react";
import {
  MenuList,
  MenuItem,
  Menu,
  MenuButton,
  IconButton,
  HStack,
  chakra,
} from "@chakra-ui/react";
import cx from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import colors from "themes/colors.theme";
import { IFilter } from "types/common";
import { seenNotification } from "API/notification";
import SvgIcon from "components/SvgIcon";
import { EBreakPoint } from "constants/theme";
import { INotificationWithRelations } from "interfaces/notification";
import routes from "routes";
import CommentNotification from "./components/CommentNofication";
import DeleteCommonStepNotification from "./components/DeleteCommonStepNotification";
import UpdateCommonStepNotification from "./components/UpdateCommonStepNotification";
import styles from "./styles.module.scss";
import { NotificationTypeEnum } from "config/constant/enums/notification";
dayjs.extend(relativeTime);

function NotificationBell() {
  const { notificationStore, authStore } = useStores();
  const {
    notifications,
    countNotifications = 0,
    countNotSeenNotifications = 0,
  } = notificationStore;
  const page = 0;
  const pageSize = 10;
  const navigate = useNavigate();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

  function fetchData() {
    const filter: IFilter<INotificationWithRelations> = {
      where: {
        userId: authStore?.userDetail?.id,
        $or: [
          { type: NotificationTypeEnum.COMMENT_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.DELETED_STEP_NOTIFICATION },
          { type: NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION },
          { type: NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION },
        ],
      },
      include: [
        { relation: "process" },
        { relation: "author" },
        { relation: "step" },
      ],
      limit: pageSize,
      skip: page * pageSize,
      order: "createdAt DESC",
    };
    notificationStore.setListFilter(filter);
    notificationStore.fetchNotifications();
    notificationStore.aggregateCountNotifications();
  }

  useEffect(() => {
    if (authStore?.userDetail?.id) {
      fetchData();
    }
  }, [authStore?.userDetail?.id]);

  return (
    <div className={styles.container}>
      <Menu>
        {countNotSeenNotifications > 0 && (
          <div className={styles.notificationCount}>
            {countNotSeenNotifications}
          </div>
        )}
        <MenuButton
          as={IconButton}
          onClick={() => notificationStore.fetchNotifications()}
          aria-label="Notifications"
          background="transparent"
          _hover={{ background: "transparent" }}
          _active={{ background: "transparent" }}
          border="none"
          icon={
            <SvgIcon iconName="notification-bell" size={isMobile ? 24 : 20} />
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
            <chakra.div
              onClick={async () => {
                await notificationStore.seenAllNotifications();
                toast.success("Marked all as read");
                fetchData();
              }}
              className={styles.mark}
              color="var(--current-primary-color)"
              _hover={{
                color: "var(--current-primary-color)" ?? "primary.700",
                opacity: 0.8,
              }}
            >
              Mark all as read
            </chakra.div>
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
                  onClick={() => {
                    navigate(routes.notifications.value);
                    seenNotification(notification?.id ?? "");
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
                    ].includes(notification?.type as NotificationTypeEnum) && (
                      <UpdateCommonStepNotification
                        notification={notification}
                      />
                    )}
                    {[
                      NotificationTypeEnum.DELETED_STEP_NOTIFICATION,
                      NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION,
                    ].includes(notification?.type as NotificationTypeEnum) && (
                      <DeleteCommonStepNotification
                        notification={notification}
                      />
                    )}
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
      </Menu>
    </div>
  );
}

export default observer(NotificationBell);
