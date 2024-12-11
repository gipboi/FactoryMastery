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
import { IOrganization } from "interfaces/organization";
import { IProcessWithRelations } from "interfaces/process";
import { IStepWithRelations } from "interfaces/step";
import compact from "lodash/compact";
import debounce from "lodash/debounce";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import CustomButton from "../../../../../CustomButton";
import ExternalStepItem from "../ExternalStepItem";
import styles from "./externalStepModal.module.scss";

interface IExternalStepProps {
  isOpen: boolean;
  linkedSteps: IOption<string>[];
  processId: string;
  onClose: () => void;
  setLinkedSteps: (linkedSteps: SetStateAction<IOption<string>[]>) => void;
  handleSave: () => void;
}

const ExternalStep = (props: IExternalStepProps) => {
  const {
    isOpen,
    onClose,
    linkedSteps,
    setLinkedSteps,
    processId,
    handleSave,
  } = props;
  const { processStore, organizationStore } = useStores();
  const organization: IOrganization | null = organizationStore.organization;
  const [processListSearch, setProcessListSearch] = useState<
    IProcessWithRelations[]
  >(processStore.processList);
  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);
  const handleChange = useCallback(
    debounce((event: { target: { value: string } }) => {
      const keyword: string = event?.target?.value?.toLowerCase();
      const listMatchedProcess: IProcessWithRelations[] = compact(
        getValidArray(processStore.processList).map(
          (process: IProcessWithRelations) => {
            if (process?.name?.toLowerCase().includes(keyword)) return process;
            const steps: IStepWithRelations[] = getValidArray(
              process?.steps
            ).filter((step: IStepWithRelations) =>
              step?.name?.toLowerCase().includes(keyword)
            );
            if (getValidArray(steps).length > 0 || !keyword) {
              return {
                ...process,
                steps,
              };
            }
            return null;
          }
        )
      );
      setProcessListSearch(listMatchedProcess);
    }, 1000),
    []
  );

  function handleClose(): void {
    onClose();
    setProcessListSearch(getValidArray(processStore?.processList));
  }
  function handleSelect(): void {
    onClose();
    handleSave();
  }

  useEffect(() => {
    setProcessListSearch(getValidArray(processStore.processList));
  }, [processStore.processList]);

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
          Link to External step
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
              placeholder="Search by process name or step name"
              onChange={handleChange}
            />
          </InputGroup>
          <Box
            className={styles.collectionLayout}
            width="100%"
            flexDirection="column"
            overflowY="auto"
          >
            {getValidArray(processListSearch).map(
              (processItem: IProcessWithRelations, index: number) => {
                if (
                  processItem?.organizationId === organization?.id &&
                  processItem?.id !== processId
                ) {
                  return (
                    <Box
                      key={`processItem-${processItem?.id}-${index}`}
                      margin={0}
                      padding={0}
                    >
                      <ExternalStepItem
                        process={processItem}
                        linkedExternalSteps={linkedSteps}
                        setLinkedExternalSteps={setLinkedSteps}
                      />
                    </Box>
                  );
                }
                return null;
              }
            )}
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

export default ExternalStep;
