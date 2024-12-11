import { useState } from "react";
import { Button, HStack, useDisclosure } from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { seenNotification } from "API/notification";
import Image from "components/Image";
import { INotificationWithRelations } from "interfaces/notification";
import { ITheme } from "interfaces/theme";
import routes from "routes";
import styles from "../../styles.module.scss";
import { primary500 } from "themes/globalStyles";
import { NotificationTypeEnum } from "config/constant/enums/notification";
import Avatar from "components/Avatar";
import { getName } from "utils/user";

interface IDeleteCommonStepNotificationProps {
  notification: INotificationWithRelations;
}

const DeleteCommonStepNotification = ({
  notification,
}: IDeleteCommonStepNotificationProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isOpenAffectedProcess,
    onOpen: onOpenAffectedProcess,
    onClose: onCloseOpenAffectedProcess,
  } = useDisclosure();
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const detailNoti: string =
    notification?.type === NotificationTypeEnum.DELETED_STEP_NOTIFICATION
      ? `Step ${notification?.step?.name ?? notification?.deletedName ?? ""}`
      : `Process ${notification?.process?.name ?? notification?.deletedName}`;
  return (
    <>
      <HStack style={{ cursor: "pointer" }} alignItems="flex-start">
        <Avatar
          name={getName(notification?.author) ?? ""}
          src={notification?.author?.image ?? ""}
        />
        <div>
          <span
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
              {notification?.title ?? ""}
            </span>
          </span>
          {/* <HStack marginTop="8px">
            <Button
              borderRadius="6px"
              lineHeight={'20px'}
              fontWeight={500}
              height={'32px'}
              fontSize={14}
              disabled={isLoading}
              colorScheme="teal"
              padding="10px 12px"
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onOpenAffectedProcess()
              }}
              backgroundColor={currentTheme?.primaryColor ?? primary500}
              _hover={{
                backgroundColor: currentTheme?.primaryColor ?? 'primary700',
                opacity: currentTheme?.primaryColor ? 0.8 : 1
              }}
              _active={{
                background: currentTheme?.primaryColor ?? 'primary.700',
                opacity: currentTheme?.primaryColor ? 0.8 : 1
              }}
              border={'none'}
            >
              See affected processes
            </Button>
          </HStack> */}
        </div>
      </HStack>

      {/* <CommonStepDetailModal
        notification={notification}
        isOpen={isOpenAffectedProcess}
        toggle={onCloseOpenAffectedProcess}
      /> */}
    </>
  );
};

export default observer(DeleteCommonStepNotification);
