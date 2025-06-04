import { Button, HStack, useDisclosure } from "@chakra-ui/react";
import cx from "classnames";
import Image from "components/Image";
import { useStores } from "hooks/useStores";
import { INotificationWithRelations } from "interfaces/notification";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import styles from "../styles.module.scss";
import { primary500 } from "themes/globalStyles";
import { NotificationTypeEnum } from "config/constant/enums/notification";
import Avatar from "components/Avatar";
import { getName } from "utils/user";

interface IUpdateChangeCommonStepNotificationProps {
  notification: INotificationWithRelations;
}

const UpdateChangeCommonStepNotification = ({
  notification,
}: IUpdateChangeCommonStepNotificationProps) => {
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  const {
    isOpen: isOpenAffectedProcess,
    onOpen: onOpenAffectedProcess,
    onClose: onCloseOpenAffectedProcess,
  } = useDisclosure();

  const detailNoti: string =
    notification?.type === NotificationTypeEnum.DELETED_STEP_NOTIFICATION
      ? `Step ${notification?.step?.name ?? notification?.deletedName ?? ""}`
      : `Process ${notification?.process?.name ?? notification?.deletedName}`;

  return (
    <>
      <HStack style={{ cursor: "pointer" }}>
        <Avatar
          name={getName(notification?.author) ?? ""}
          src={notification?.author?.image ?? ""}
          isMiddle
        />
        <div>
          <span className={cx(styles.object, styles.textContent)}>
            {detailNoti}
          </span>
          <span className={cx(styles.textContent)}>
            {notification?.title ?? ""}
          </span>
        </div>
      </HStack>
    </>
  );
};

export default observer(UpdateChangeCommonStepNotification);
