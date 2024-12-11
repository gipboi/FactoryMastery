import { CloseIcon, InfoIcon } from "@chakra-ui/icons";
import { Button, HStack, useDisclosure } from "@chakra-ui/react";
import cx from "classnames";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { useState } from "react";
import { toast } from "react-toastify";
// import { updateDerivedStep } from 'API/step'
import ConfirmModal from "components/Chakra/ConfirmModal";
import { getValidArray } from "utils/common";
import styles from "./styles.module.scss";

interface IUpdatedDerivedStepsModalProps {
  refetch: () => void;
  openReview: () => void;
}

const UpdatedDerivedStepsModal = ({
  refetch,
  openReview,
}: IUpdatedDerivedStepsModalProps) => {
  const { processStore } = useStores();
  const { process } = processStore;
  const steps = getValidArray(process?.steps);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [close, setClose] = useState(false);
  // const derivedStepsNeedToUpdate = steps.filter((step) => {
  //   if (step?.originalStepId) {
  //     return commonStepIdsNeedToUpdate.includes(step?.originalStepId);
  //   }
  //   return false;
  // });

  return (
    <HStack
      justifyContent="space-between"
      className={cx(styles.container, { [styles.transition]: close })}
    >
      <HStack>
        <InfoIcon color="#4962FF" />
        {/* <div>
          {`Changes in ${derivedStepsNeedToUpdate?.length} common ${
            derivedStepsNeedToUpdate?.length > 1 ? "steps" : "step"
          }`}
        </div> */}
      </HStack>
      <HStack>
        <Button
          disabled={loading}
          onClick={onOpen}
          className={styles.updateButton}
        >
          Update changes
        </Button>
        <Button onClick={openReview} className={styles.reviewButton}>
          Review
        </Button>
        <CloseIcon cursor="pointer" onClick={() => setClose(true)} />
      </HStack>

      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onClickAccept={async () => {
          try {
            toast.info("Steps is being updated");
            onClose();
            setLoading(true);
            // for (const derivedStep of derivedStepsNeedToUpdate) {
            //   await updateDerivedStep(
            //     derivedStep?.id,
            //     derivedStep?.originalStepId
            //   );
            // }
            refetch();
            toast.success("Update steps successfully");
          } catch (error: any) {
            toast.error(`Something went wrong ${error}`);
          } finally {
            setLoading(false);
          }
        }}
        titleText="Update changes from common steps ?"
      />
    </HStack>
  );
};

export default observer(UpdatedDerivedStepsModal);
