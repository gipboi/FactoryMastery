import { useState } from "react";
import { Button, HStack, useDisclosure } from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { primary500 } from "themes/globalStyles";
import { seenNotification } from "API/notification";
import { getProcessById } from "API/process";
import { updateDerivedStep } from "API/step";
import Image from "components/Image";
import { INotificationWithRelations } from "interfaces/notification";
import { ITheme } from "interfaces/theme";
import routes from "routes";
import { convertToNotificationActionDescription } from "utils/notification";
import styles from "../../styles.module.scss";
import { NotificationTypeEnum } from "config/constant/enums/notification";
import StepDetailModal from "pages/ProcessDetailPage/components/StepDetailModal";
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
  const [isConfirmUpdate, setIsConfirmUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isOpenStepDetail,
    onOpen: onOpenStepDetail,
    onClose: onCloseStepDetail,
  } = useDisclosure();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const detailNoti: string =
    notification?.type === NotificationTypeEnum.UPDATED_STEP_NOTIFICATION
      ? `Step ${notification?.step?.name ?? ""}`
      : `Process ${notification?.process?.name ?? ""}`;

  async function updateStep() {
    const commonStepId = notification?.stepId;
    const processDetail = await getProcessById(notification.processId, {
      include: [
        {
          relation: "steps",
        },
      ],
    });
    const steps = processDetail?.steps ?? [];
    const derivedStepsNeedToUpdate = steps.filter((step) => {
      if (step?.originalStepId) {
        return step?.originalStepId === commonStepId;
      }
      return false;
    });
    try {
      setIsLoading(true);
      toast.success("Update steps successfully");
      await Promise.all(
        derivedStepsNeedToUpdate.map((derivedStep) => {
          return updateDerivedStep(
            derivedStep?.id ?? "",
            derivedStep?.originalStepId ?? ""
          );
        })
      );
      notificationStore.fetchNotifications();
      notificationStore.aggregateCountNotifications();
      setIsLoading(false);
    } catch (error: any) {
      toast.error(`Something went wrong ${error}`);
    } finally {
      onCloseStepDetail();
    }
  }

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
              {notification?.title ?? ""}
            </span>
            <span className={styles.textContent}>
              {convertToNotificationActionDescription(
                notification?.type ??
                  NotificationTypeEnum.UPDATED_STEP_NOTIFICATION
              )}
            </span>
          </span>
          {/* {isConfirmUpdate ? (
            <HStack marginTop="8px">
              <Button
                borderRadius="6px"
                lineHeight={"20px"}
                fontWeight={500}
                height={"32px"}
                fontSize={14}
                disabled={isLoading}
                colorScheme="teal"
                padding="10px 12px"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateStep();
                }}
                backgroundColor={currentTheme?.primaryColor ?? primary500}
                border={"none"}
              >
                Confirm
              </Button>
              <Button
                color="gray.700"
                height={"32px"}
                lineHeight={"20px"}
                fontWeight={500}
                fontSize={14}
                disabled={isLoading}
                border="1px solid #E2E8F0"
                borderRadius="6px"
                background="transparent"
                _hover={{ background: "gray.300" }}
                _active={{ background: "gray.400" }}
                marginRight={4}
                padding="10px 12px"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsConfirmUpdate(false);
                }}
              >
                Cancel
              </Button>
            </HStack>
          ) : (
            <HStack marginTop="8px">
              <Button
                borderRadius="6px"
                lineHeight={"20px"}
                fontWeight={500}
                height={"32px"}
                fontSize={14}
                colorScheme="teal"
                padding="10px 12px"
                onClick={onOpenStepDetail}
                backgroundColor={currentTheme?.primaryColor ?? primary500}
                _hover={{
                  backgroundColor: currentTheme?.primaryColor ?? "primary700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _active={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                border={"none"}
              >
                Review
              </Button>
              <Button
                color="gray.700"
                height={"32px"}
                lineHeight={"20px"}
                fontWeight={500}
                fontSize={14}
                border="1px solid #E2E8F0"
                borderRadius="6px"
                background="transparent"
                _hover={{ background: "gray.300" }}
                _active={{ background: "gray.400" }}
                marginRight={4}
                padding="10px 12px"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsConfirmUpdate(true);
                }}
              >
                Update changes
              </Button>
            </HStack>
          )} */}
        </div>
      </HStack>

      {isOpenStepDetail && (
        <StepDetailModal
          displayStepIds={[notification?.stepId]}
          stepId={notification?.stepId}
          isOpen={isOpenStepDetail}
          onClose={onCloseStepDetail}
          handleUpdate={updateStep}
        />
      )}
    </>
  );
};

export default observer(UpdateChangeCommonStepNotification);
