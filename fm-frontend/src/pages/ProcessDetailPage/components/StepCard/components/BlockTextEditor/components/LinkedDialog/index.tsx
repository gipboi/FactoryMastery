import { Box } from "@chakra-ui/react";
import { ModalDialogProps } from "components/ModalDialog";
import { useStores } from "hooks/useStores";
import { IDecisionPointLink } from "interfaces/decisionPoint";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import get from "lodash/get";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { BlockTextFormValues } from "../../enums";
import ExternalStepModal from "./components/ExternalStepModal";
import InternalStepModal from "./components/InternalStepModal";
import MediaModal from "./components/MediaModal";
import { handleSave, searchSteps } from "./utils";

interface ILinkedDialogProps extends ModalDialogProps {
  textContentId: string;
  step: IStepWithRelations;
  decisionPointIndex: number;
  isOpenLinkInternalStep: boolean;
  isOpenLinkExternalStep: boolean;
  handleShowManageMediaDialog: () => void;
  handleShowEmbedLinkModal: () => void;
  setShowDecisionPointDialog: (showDecisionPointDialog: boolean) => void;
  setShowLinkInternalStep: (showLinkInternalStep: boolean) => void;
  setShowLinkExternalStep: (showLinkExternalStep: boolean) => void;
}

const LinkedDialog = (props: ILinkedDialogProps) => {
  const {
    step,
    decisionPointIndex,
    setShowDecisionPointDialog,
    isOpen,
    handleShowManageMediaDialog,
    handleShowEmbedLinkModal,
    setShowLinkInternalStep,
    setShowLinkExternalStep,
    isOpenLinkInternalStep,
    isOpenLinkExternalStep,
  } = props;
  const { stepStore, organizationStore, processStore } = useStores();
  const { setValue, control } = useFormContext();
  const decisionPoints: IDecisionPointLink = useWatch({
    name: BlockTextFormValues.DECISION_POINTS,
    control,
  }) as IDecisionPointLink;

  const [linkedSteps, setLinkedSteps] = useState<IOption<string>[]>([]);
  const [linkedMedia, setLinkedMedia] = useState<IMedia[]>([]);
  const { organization } = organizationStore;
  const getProcessList = async () => {
    await processStore.getAllProcessList(organization?.id ?? "", 0);
  };

  function handleSaveDecisions(): void {
    handleSave(
      decisionPoints,
      linkedSteps,
      linkedMedia,
      decisionPointIndex,
      setValue
    );
    setShowDecisionPointDialog(false);
    setLinkedMedia([]);
    setLinkedSteps([]);
  }

  useEffect(() => {
    searchSteps(stepStore, "", Number(organization?.id));
    if (getValidArray(processStore.processList).length === 0) {
      getProcessList();
    }
  }, []);

  useEffect(() => {
    const linkedSteps = get(
      decisionPoints,
      `${decisionPointIndex}.linkedSteps`,
      []
    );
    const linkedMedia = get(
      decisionPoints,
      `${decisionPointIndex}.linkedMedia`,
      []
    );
    if (Array.isArray(linkedSteps)) {
      setLinkedSteps(
        get(decisionPoints, `${decisionPointIndex}.linkedSteps`, [])
      );
    }

    if (Array.isArray(linkedMedia)) {
      setLinkedMedia(
        get(decisionPoints, `${decisionPointIndex}.linkedMedia`, [])
      );
    }
  }, [
    decisionPointIndex,
    isOpen,
    isOpenLinkInternalStep,
    isOpenLinkExternalStep,
  ]);

  return (
    <Box>
      <MediaModal
        isOpen={isOpen ?? false}
        onClose={() => setShowDecisionPointDialog(false)}
        linkedMedia={linkedMedia}
        setLinkedMedia={setLinkedMedia}
        step={step}
        handleSave={handleSaveDecisions}
        handleShowManageMediaDialog={handleShowManageMediaDialog}
        handleShowEmbedLinkModal={handleShowEmbedLinkModal}
      />
      <InternalStepModal
        isOpen={isOpenLinkInternalStep}
        onClose={() => setShowLinkInternalStep(false)}
        linkedSteps={linkedSteps}
        setLinkedSteps={setLinkedSteps}
        handleSave={handleSaveDecisions}
      />
      <ExternalStepModal
        isOpen={isOpenLinkExternalStep}
        onClose={() => setShowLinkExternalStep(false)}
        processId={step?.processId ?? ""}
        linkedSteps={linkedSteps}
        setLinkedSteps={setLinkedSteps}
        handleSave={handleSaveDecisions}
      />
    </Box>
  );
};

export default observer(LinkedDialog);
