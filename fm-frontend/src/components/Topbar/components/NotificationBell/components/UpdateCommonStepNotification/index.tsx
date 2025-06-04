import { HStack } from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { seenNotification } from "API/notification";
import { INotificationWithRelations } from "interfaces/notification";
import { ITheme } from "interfaces/theme";
import routes from "routes";
import { convertToNotificationActionDescription } from "utils/notification";
import styles from "../../styles.module.scss";
import { NotificationTypeEnum } from "config/constant/enums/notification";
import { getName } from "utils/user";
import Avatar from "components/Avatar";

interface IUpdateChangeCommonStepNotificationProps {
  notification: INotificationWithRelations;
}

const UpdateChangeCommonStepNotification = ({
  notification,
}: IUpdateChangeCommonStepNotificationProps) => {
  const { notificationStore, organizationStore } = useStores();
  const navigate = useNavigate();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const detailNoti: string =
    notification?.type === NotificationTypeEnum.UPDATED_STEP_NOTIFICATION
      ? `Step ${notification?.step?.name ?? ""}`
      : `Process ${notification?.process?.name ?? ""}`;

  return (
    <>
      <HStack style={{ cursor: "pointer" }} alignItems="flex-start">
        <Avatar
          name={getName(notification?.author) ?? ""}
          src={notification?.author?.image ?? ""}
        />
        <div>
          <span
            className={cx(styles.object, styles.textContent)}
            onClick={async () => {
              await seenNotification(notification?.id ?? "");
              navigate(
                routes.processes.processId.value(`${notification.processId}`)
              );
            }}
          >
            <span className={cx(styles.object, styles.textContent)}>
              {detailNoti}
            </span>
            <span className={cx(styles.textContent)}>
              {notification?.title?.replace(/\.$/, "") ?? ""}
            </span>
            <span className={cx(styles.object, styles.textContent)}>
              by {getName(notification?.author)}
            </span>
            <span className={styles.textContent}>
              {convertToNotificationActionDescription(
                notification?.type ??
                  NotificationTypeEnum.UPDATED_STEP_NOTIFICATION
              )}
            </span>
          </span>
        </div>
      </HStack>
    </>
  );
};

export default observer(UpdateChangeCommonStepNotification);
