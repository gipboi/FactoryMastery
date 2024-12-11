import { HStack } from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { useNavigate } from "react-router-dom";
import { seenNotification } from "API/notification";
import Image from "components/Image";
import { INotificationWithRelations } from "interfaces/notification";
import routes from "routes";
import { convertToNotificationActionDescription } from "utils/notification";
import styles from "../../styles.module.scss";
import { NotificationTypeEnum } from "config/constant/enums/notification";

const CommentNotification = ({
  notification,
}: {
  notification: INotificationWithRelations;
}) => {
  const navigate = useNavigate();
  const { stepStore } = useStores();

  function navigateToStepDetail(
    notification: INotificationWithRelations
  ): void {
    if (notification.processId) {
      navigate(
        routes.processes.processId.value(String(notification.processId))
      );
    }
    if (notification.stepId) {
      stepStore.selectedStep = notification.step;
    }
    seenNotification(notification?.id ?? "");
  }

  return (
    <HStack alignItems="flex-start">
      <Image
        containerClassName={styles.avatar}
        src={notification?.author?.image}
        alt="avatar"
      />
      <div>
        <span className={cx(styles.object, styles.textContent)}>
          {notification?.author?.firstName} {notification?.author?.lastName}{" "}
        </span>
        <span className={styles.textContent}>
          {convertToNotificationActionDescription(
            notification?.type ?? NotificationTypeEnum.COMMENT_STEP_NOTIFICATION
          )}
        </span>
        <span
          className={cx(styles.object, styles.textContent)}
          onClick={(event) => {
            event.stopPropagation();
            navigateToStepDetail(notification);
          }}
        >
          Process #{notification?.process?.name}
        </span>
      </div>
    </HStack>
  );
};

export default CommentNotification;
