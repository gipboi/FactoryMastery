import { Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IStep, IStepWithRelations } from "interfaces/step";
import debounce from "lodash/debounce";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import CustomButton from "../../../../../CustomButton";
import { stepToOption } from "../../adapter";
import StepItem from "../StepItem";
import styles from "./internalStepModal.module.scss";

interface IInternalStepModalProps {
  isOpen: boolean;
  linkedSteps: IOption<string>[];
  onClose: () => void;
  setLinkedSteps: (linkedSteps: SetStateAction<IOption<string>[]>) => void;
  handleSave: () => void;
}

const InternalStepModal = (props: IInternalStepModalProps) => {
  const { isOpen, onClose, linkedSteps, setLinkedSteps, handleSave } = props;
  const { processStore } = useStores();
  const { process } = processStore;
  const [steps, setSteps] = useState<IStepWithRelations[]>(
    getValidArray(process?.steps)
  );
  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

  const handleChange = useCallback(
    debounce((event: { target: { value: string } }) => {
      const listMatchedSteps = getValidArray(process?.steps).filter(
        (step: IStepWithRelations) => {
          return step?.name
            ?.toLowerCase()
            .includes(event.target.value.toLowerCase());
        }
      );
      setSteps(listMatchedSteps);
    }, 300),
    []
  );

  function handleClose(): void {
    onClose();
    setSteps(getValidArray(process?.steps));
  }

  function handleSelect(): void {
    onClose();
    handleSave();
  }

  useEffect(() => {
    if (isOpen) {
      setSteps(getValidArray(process?.steps));
    }
  }, [isOpen]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent minWidth={isTablet ? "auto" : "800px"}>
        <ModalHeader
          fontSize="lg"
          fontWeight={500}
          lineHeight={7}
          color="gray.800"
        >
          Link to internal step
        </ModalHeader>
        <Divider color="gray.200" margin={0} />
        <ModalCloseButton
          background="white"
          border="none"
          boxShadow="none !important"
        />
        <ModalBody padding={6}>
          <InputGroup
            borderRadius="6px"
            background="white"
            display={{ md: "block" }}
          >
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.400" />
            </InputLeftElement>
            <Input
              type="search"
              placeholder="Search step by name"
              onChange={handleChange}
            />
          </InputGroup>
          <Box
            className={styles.collectionLayout}
            width="100%"
            flexDirection="column"
            overflowY="auto"
          >
            {getValidArray(steps).map((step: IStep) => {
              return (
                <StepItem
                  key={`internal-step-${step?.id ?? step?._id}`}
                  step={stepToOption(step)}
                  setLinkedSteps={setLinkedSteps}
                  linkedSteps={linkedSteps}
                />
              );
            })}
          </Box>
        </ModalBody>
        <Divider color="gray.200" margin={0} />
        <ModalFooter>
          <CustomButton
            content="Cancel"
            className="outline"
            onClick={handleClose}
          />
          <CustomButton
            content="Select step"
            className="primary"
            onClick={handleSelect}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InternalStepModal;
