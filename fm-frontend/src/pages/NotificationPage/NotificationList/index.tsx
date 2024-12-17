import { seenNotification } from "API/notification";
import cx from "classnames";
import GlobalSpinner from "components/GlobalSpinner";
import { NotificationTypeEnum } from "config/constant/enums/notification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useStores } from "hooks/useStores";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import routes from "routes";
import DeleteCommonStepNotification from "./DeleteStepNotification";
import UpdateChangeCommonStepNotification from "./UpdateStepNotification";
import styles from "./styles.module.scss";
import CommentStepNotification from "./CommentStepNotification";
import { Box } from "@chakra-ui/react";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "a min",
    mm: "%d min",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

const NotificationList = () => {
  const navigate = useNavigate();
  const { notificationStore, stepStore } = useStores();
  const { notifications } = notificationStore;
  const notificationList = Array.isArray(notifications) ? notifications : [];

  return (
    <div className={styles.container}>
      {notificationList.map((notification) => {
        return (
          <Box
            className={cx(styles.notificationItem, {
              [styles.notificationItemNotSeen]: !notification.isSeen,
            })}
            key={notification.id}
            onClick={() => {
              if (notification.processId) {
                navigate(
                  routes.processes.processId.value(
                    String(notification.processId)
                  )
                );
              }
              if (notification.stepId) {
                stepStore.selectedStep = notification.step;
              }
              seenNotification(notification?.id ?? "");
            }}
          >
            <Box className={styles.notificationContent}>
              {notification?.type ===
                NotificationTypeEnum.COMMENT_STEP_NOTIFICATION && (
                <CommentStepNotification notification={notification} />
              )}
              {[
                NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
                NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION,
              ].includes(notification?.type as NotificationTypeEnum) && (
                <UpdateChangeCommonStepNotification
                  notification={notification}
                />
              )}
              {[
                NotificationTypeEnum.DELETED_STEP_NOTIFICATION,
                NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION,
              ].includes(notification?.type as NotificationTypeEnum) && (
                <DeleteCommonStepNotification notification={notification} />
              )}
            </Box>
            <Box >
              <span className={styles.timestamp}>
                {dayjs(notification?.createdAt).fromNow(true)}
              </span>
            </Box>
          </Box>
        );
      })}
      {/* <div ref={ref} className={styles.threshold}>
        {isFetching && <GlobalSpinner />}
      </div> */}
    </div>
  );
};

export default observer(NotificationList);
