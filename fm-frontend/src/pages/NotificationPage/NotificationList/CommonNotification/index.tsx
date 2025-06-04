import { HStack, Tooltip } from "@chakra-ui/react";
import cx from "classnames";
import { INotificationWithRelations } from "interfaces/notification";
import { observer } from "mobx-react";
import styles from "../styles.module.scss";
import Avatar from "components/Avatar";
import { getName } from "utils/user";

interface ICommonNotificationProps {
  notification: INotificationWithRelations;
}

const CommonNotification = ({
  notification,
}: ICommonNotificationProps) => {
  const detailNoti: string = getName(notification?.author)
  
  return (
    <>
      <HStack style={{ cursor: "pointer" }}>
        <Tooltip
          label={getName(notification?.author) ?? ""}
          height="36px"
          fontSize="14px"
          lineHeight="20px"
          fontWeight="400"
          padding={2}
          placement="top-start"
          background="#5C5C5C"
          color="white"
          hasArrow
          borderRadius="4px"
          shouldWrapChildren
        >
          <Avatar
            name={getName(notification?.author) ?? ""}
            src={notification?.author?.image ?? ""}
            isMiddle
          />
        </Tooltip>
        <div>
          <span className={cx(styles.object, styles.textContent)}>
            {detailNoti}
          </span>
          <span className={cx(styles.textContent)}>
            {notification?.title ?? ""}.
          </span>
        </div>
      </HStack>
    </>
  );
};

export default observer(CommonNotification);
