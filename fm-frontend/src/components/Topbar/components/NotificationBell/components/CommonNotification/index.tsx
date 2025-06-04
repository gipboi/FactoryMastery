import { HStack } from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { seenNotification } from "API/notification";
import { INotificationWithRelations } from "interfaces/notification";
import routes from "routes";
import styles from "../../styles.module.scss";
import { getName } from "utils/user";
import Avatar from "components/Avatar";

interface ICommonNotificationProps {
  notification: INotificationWithRelations;
}

const CommonNotification = ({
  notification,
}: ICommonNotificationProps) => {
  const navigate = useNavigate();
  const detailNoti: string = getName(notification?.author)

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
            }}
          >
            <span className={cx(styles.object, styles.textContent)}>
              {detailNoti}
            </span>
            <span className={cx(styles.textContent)}>
              {notification?.title ?? ""}.
            </span>
          </span>
        </div>
      </HStack>
    </>
  );
};

export default observer(CommonNotification);
