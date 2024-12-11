import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Radio,
  RadioGroup,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { ICommonLibrary } from "interfaces/commonLibrary";
import { IProcessWithRelations } from "interfaces/process";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import { useState } from "react";
// import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder'
import { getValidArray } from "utils/common";
import StepDetailModal from "../../../../../../../StepDetailModal";
import styles from "./styles.module.scss";

const SelectStepPanel = ({
  data = [],
  selectedOption,
  setSelectedOption,
}: {
  data: ICommonLibrary[];
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}) => {
  const [selectedProcessStepIds, setSelectedProcessStepIds] = useState<
    string[]
  >([]);
  const {
    isOpen: isOpenStepDetail,
    onOpen: onOpenStepDetail,
    onClose: onCloseStepDetail,
  } = useDisclosure();
  const formatData = groupBy(data, "processId");

  return (
    <div className={styles.panelContainer}>
      <Accordion defaultIndex={[0]} allowMultiple>
        {getValidArray(Object.values(formatData)).map(
          (commonLibrarySteps: ICommonLibrary[], index: number) => {
            const process: IProcessWithRelations | undefined = get(
              commonLibrarySteps,
              "[0].process"
            );
            const iconBuilder = process?.documentType?.iconBuilder;
            return (
              <AccordionItem key={`accordionItem-${index}`}>
                <AccordionButton className={styles.dropDown}>
                  <div style={{ marginRight: 12 }}>
                    {/* {iconBuilder ? (
                      <IconBuilder icon={iconBuilder} size={32} isActive />
                    ) : (
                      <Tooltip
                        label={"Default icon for process"}
                        height="36px"
                        fontSize="14px"
                        lineHeight="20px"
                        fontWeight="400"
                        padding={2}
                        marginBottom={2}
                        placement="top-start"
                        background="#5C5C5C"
                        color="white"
                        hasArrow
                        borderRadius="4px"
                        shouldWrapChildren
                      >
                        <ProcedureIcon
                          procedureIcon={
                            (process as IProcessWithRelations)?.procedureIcon
                          }
                          size={32}
                        />
                      </Tooltip>
                    )} */}
                  </div>
                  <Box as="span" flex="1" textAlign="left">
                    {process?.name ?? ""}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <RadioGroup
                    value={selectedOption}
                    onChange={(optionValue) => {
                      setSelectedOption(String(optionValue));
                      setSelectedProcessStepIds(
                        getValidArray(commonLibrarySteps).map(
                          (step) => step?.stepId ?? ""
                        )
                      );
                    }}
                  >
                    <VStack alignItems="flex-start">
                      {getValidArray(commonLibrarySteps).map(
                        (commonStep: ICommonLibrary) => {
                          const step = commonStep?.step;
                          if (step && step?.id) {
                            return (
                              <Radio value={String(+step.id)}>
                                <HStack>
                                  {/* {!step.iconId ? (
                                    <IconBuilder
                                      icon={step.icon}
                                      size={32}
                                      isActive
                                    />
                                  ) : (
                                    <IconBuilder icon={stepIcon} size={40} isActive />
                                  )} */}
                                  <Tooltip
                                    label={"View step details"}
                                    height="36px"
                                    fontSize="14px"
                                    lineHeight="20px"
                                    fontWeight="400"
                                    padding={2}
                                    marginBottom={2}
                                    placement="top-start"
                                    background="#595a5b"
                                    color="white"
                                    hasArrow
                                    borderRadius="4px"
                                    shouldWrapChildren
                                  >
                                    <div
                                      onClick={onOpenStepDetail}
                                      className={styles.stepName}
                                    >
                                      {step?.name ?? ""}
                                    </div>
                                  </Tooltip>
                                </HStack>
                              </Radio>
                            );
                          }
                          return null;
                        }
                      )}
                    </VStack>
                  </RadioGroup>
                </AccordionPanel>
              </AccordionItem>
            );
          }
        )}
      </Accordion>

      {isOpenStepDetail && selectedOption && (
        <StepDetailModal
          stepId={selectedOption}
          displayStepIds={selectedProcessStepIds}
          isOpen={isOpenStepDetail}
          onClose={onCloseStepDetail}
          handleSelect={(id) => setSelectedOption(String(id))}
        />
      )}
    </div>
  );
};

export default SelectStepPanel;
