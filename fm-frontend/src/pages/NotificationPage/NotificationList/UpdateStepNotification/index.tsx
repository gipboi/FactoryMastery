import { Button, HStack, Tooltip, useDisclosure } from '@chakra-ui/react';
import { getProcessById } from 'API/process';
// import { updateDerivedStep } from "API/step";
import cx from 'classnames';
import Image from 'components/Image';
import { NotificationTypeEnum } from 'config/constant/enums/notification';
import { useStores } from 'hooks/useStores';
import { INotificationWithRelations } from 'interfaces/notification';
import { ITheme } from 'interfaces/theme';
import { observer } from 'mobx-react';
import StepDetailModal from 'pages/ProcessDetailPage/components/StepDetailModal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { convertToNotificationActionDescription } from 'utils/notification';
import styles from '../styles.module.scss';
import { primary500 } from 'themes/globalStyles';
import Avatar from 'components/Avatar';
import { getName } from 'utils/user';

interface IUpdateChangeCommonStepNotificationProps {
  notification: INotificationWithRelations;
}

const UpdateChangeCommonStepNotification = ({
  notification,
}: IUpdateChangeCommonStepNotificationProps) => {
  const { notificationStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const [isConfirmUpdate, setIsConfirmUpdate] = useState(false);
  const {
    isOpen: isOpenStepDetail,
    onOpen: onOpenStepDetail,
    onClose: onCloseStepDetail,
  } = useDisclosure();

  const detailNoti: string =
    notification?.type === NotificationTypeEnum.UPDATED_STEP_NOTIFICATION
      ? `Step ${notification?.step?.name ?? ''}`
      : `Process ${notification?.process?.name ?? ''}`;

  async function updateStep() {
    const commonStepId = notification?.stepId;
    const processDetail = await getProcessById(notification.processId, {
      include: [
        {
          relation: 'steps',
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
    toast.info('Steps is being updated');
    try {
      toast.success('Update steps successfully');
      await Promise.all(
        derivedStepsNeedToUpdate.map((derivedStep) => {
          // return updateDerivedStep(
          //   derivedStep?.id,
          //   derivedStep?.originalStepId
          // );
        })
      );
      notificationStore.fetchNotifications();
    } catch (error: any) {
      toast.error(`Something went wrong ${error}`);
    } finally {
      onCloseStepDetail();
    }
  }
  return (
    <>
      <HStack style={{ cursor: 'pointer' }}>
        <Tooltip
          label={getName(notification?.author) ?? ''}
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
            name={getName(notification?.author) ?? ''}
            src={notification?.author?.image ?? ''}
            isMiddle
          />
        </Tooltip>
        <div>
          <span className={cx(styles.object, styles.textContent)}>
            {detailNoti}
          </span>
          <span className={cx(styles.textContent)}>
            {notification?.title?.replace(/\.$/, '') ?? ''} by 
          </span>
          <span className={cx(styles.object, styles.textContent)}>
            {getName(notification?.author)}
          </span>
          <span className={styles.textContent}>
            {convertToNotificationActionDescription(
              notification?.type ??
                NotificationTypeEnum.UPDATED_STEP_NOTIFICATION
            )}
          </span>
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
