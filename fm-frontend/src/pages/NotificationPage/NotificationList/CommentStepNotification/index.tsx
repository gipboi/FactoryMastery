import cx from "classnames";
import Image from "components/Image";
import { INotificationWithRelations } from "interfaces/notification";
import { observer } from "mobx-react";
import styles from "../styles.module.scss";
import { convertToNotificationActionDescription } from "utils/notification";
import { NotificationTypeEnum } from "config/constant/enums/notification";

const CommentNotification = ({
  notification,
}: {
  notification: INotificationWithRelations;
}) => {
  return (
    <>
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
        <span className={cx(styles.object, styles.textContent)}>
          Process #{notification?.process?.name}
        </span>
      </div>
    </>
  );
};

export default observer(CommentNotification);
