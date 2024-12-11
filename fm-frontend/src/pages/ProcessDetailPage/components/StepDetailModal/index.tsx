import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
} from "@chakra-ui/react";
import Button from "components/Button";
import Spinner from "components/Spinner";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import colors from "themes/colors.theme";
import { primary, primary500 } from "themes/globalStyles";
import StepCard from "../StepCard";
import styles from "./styles.module.scss";

interface IStepDetailModalProps {
  stepId: string;
  isOpen: boolean;
  displayStepIds: string[];
  onClose: () => void;
  handleSelect?: (stepId: string) => void;
  handleUpdate?: (commonStepId: string) => void;
}

function StepDetailModal({
  isOpen,
  onClose,
  handleSelect,
  handleUpdate,
  stepId,
  displayStepIds,
}: IStepDetailModalProps) {
  const { commonLibraryStore, organizationStore } = useStores();
  const [displayingStepId, setDisplayingStepId] = useState<string>();
  const { currentCommonStepDetail } = commonLibraryStore;
  const indexCurrentStepId = displayStepIds.indexOf(displayingStepId ?? "");
  const isLoading = displayStepIds?.length > 1;
  // ? displayingStepId !== currentCommonStepDetail?.id
  // : stepId !== currentCommonStepDetail?.id;
  const selectId = displayStepIds?.length > 1 ? displayingStepId : stepId;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  // no multiple steps
  useEffect(() => {
    if (
      stepId &&
      stepId !== currentCommonStepDetail?.id &&
      displayStepIds?.length === 1
    ) {
      commonLibraryStore.fetchCurrentCommonStepDetail(stepId);
    }
  }, [stepId, stepId !== currentCommonStepDetail?.id, displayStepIds]);

  // useEffect(() => {
  //   if (displayStepIds?.length > 1) {
  //     let idToFetch = displayingStepId;
  //     if (!displayingStepId) {
  //       // setDisplayingStepId(stepId);
  //       // idToFetch = stepId;
  //     }
  //     commonLibraryStore.fetchCurrentCommonStepDetail(idToFetch);
  //   }
  // }, [displayStepIds, displayingStepId !== currentCommonStepDetail?.id]);

  function getNextStepToDisplay(direction: "back" | "next"): void {
    const index = displayStepIds.indexOf(displayingStepId ?? "");
    let nextStepId = "";

    if (index === -1) {
      nextStepId = "";
    }

    if (direction === "next") {
      nextStepId =
        index < displayStepIds.length - 1 ? displayStepIds[index + 1] : "";
    }
    if (direction === "back") {
      nextStepId = index > 0 ? displayStepIds[index - 1] : "";
    }

    if (nextStepId > "") {
      setDisplayingStepId(nextStepId ?? "");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        commonLibraryStore.clearCurrentCommonStepDetail();
      }}
      size="3xl"
    >
      <ModalOverlay />
      <ModalContent className={styles.addDialog} height={"89vh"}>
        <ModalHeader
          fontWeight="500"
          fontSize="18px"
          lineHeight="28px"
          color="gray.800"
          borderBottom="1px solid #E2E8F0"
        >
          Step detail
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ background: "#fff", borderColor: "unset" }}
        />
        <ModalBody paddingTop="24px" paddingBottom="27px" overflow="scroll">
          {currentCommonStepDetail && !isLoading ? (
            <StepCard
              canEditProcess={false}
              isStartEditing={false}
              isDragging={false}
              procedureId={""}
              step={currentCommonStepDetail}
              lastStep={true}
              handleShowAutosave={() => {}}
              setDisabledButtonPublishDraft={() => {}}
              alwayExpand
            />
          ) : (
            <Spinner />
          )}
        </ModalBody>

        <ModalFooter
          borderTop="1px solid #E2E8F0"
          justifyContent="space-between"
        >
          {displayStepIds.length > 1 ? (
            <HStack>
              <Tooltip
                label={"Prev step"}
                height="36px"
                fontSize="14px"
                lineHeight="20px"
                fontWeight="400"
                padding={2}
                marginBottom={2}
                placement="top"
                background="#5C5C5C"
                color="white"
                hasArrow
                borderRadius="4px"
                shouldWrapChildren
              >
                <Button
                  onClick={() => getNextStepToDisplay("back")}
                  className={styles.moveButton}
                  background={colors.gray[100]}
                  borderRadius={6}
                  disabled={
                    indexCurrentStepId === 0 || indexCurrentStepId === -1
                  }
                >
                  <ArrowBackIcon color="black" />
                </Button>
              </Tooltip>
              <Tooltip
                label={"Next step"}
                height="36px"
                fontSize="14px"
                lineHeight="20px"
                fontWeight="400"
                padding={2}
                marginBottom={2}
                placement="top"
                background="#5C5C5C"
                color="white"
                hasArrow
                borderRadius="4px"
                shouldWrapChildren
              >
                <Button
                  onClick={() => getNextStepToDisplay("next")}
                  className={styles.moveButton}
                  background={colors.gray[100]}
                  borderRadius={6}
                  disabled={
                    indexCurrentStepId === displayStepIds?.length - 1 ||
                    indexCurrentStepId === -1
                  }
                >
                  <ArrowForwardIcon color="black" />
                </Button>
              </Tooltip>
            </HStack>
          ) : (
            <div></div>
          )}
          <HStack>
            <Button
              variant="outline"
              background="white"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              color="gray.700"
              fontWeight={500}
              fontSize="16px"
              lineHeight="24px"
              _hover={{ background: "whiteAlpha.700" }}
              _active={{ background: "whiteAlpha.700" }}
              onClick={onClose}
              marginRight="16px"
            >
              Cancel
            </Button>
            {handleSelect && (
              <Button
                variant="outline"
                background="primary.500"
                borderRadius="6px"
                color="white"
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                className={styles.saveButton}
                _hover={{ background: "primary.700" }}
                _active={{ background: "primary.700" }}
                onClick={() => {
                  // handleSelect(selectId);
                  commonLibraryStore.clearCurrentCommonStepDetail();
                  onClose();
                }}
              >
                Select
              </Button>
            )}
            {handleUpdate && (
              <Button
                variant="outline"
                backgroundColor={currentTheme?.primaryColor ?? primary500}
                _hover={{ opacity: 0.8 }}
                _focus={{ opacity: 1 }}
                _active={{ opacity: 1 }}
                borderRadius="6px"
                color="white"
                fontWeight={500}
                fontSize="16px"
                lineHeight="24px"
                className={styles.saveButton}
                onClick={() => {
                  // handleUpdate(selectId);
                  commonLibraryStore.clearCurrentCommonStepDetail();
                  onClose();
                }}
              >
                Update
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default observer(StepDetailModal);
