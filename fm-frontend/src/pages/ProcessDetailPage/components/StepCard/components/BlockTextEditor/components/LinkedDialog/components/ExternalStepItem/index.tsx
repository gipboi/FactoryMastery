import { Box, Collapse, HStack, Text } from "@chakra-ui/react";
import { blockIcon } from "components/Icon";
import SvgIcon from "components/SvgIcon";
import { IProcessWithRelations } from "interfaces/process";
import { IStepWithRelations } from "interfaces/step";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { SetStateAction, useState } from "react";
import colors from "themes/colors.theme";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { stepToOptions } from "../../adapter";
import { primary100, textColorBlack } from "../../constants";
import StepItem from "../StepItem";

interface IExternalStepItemProps {
  process: IProcessWithRelations;
  linkedExternalSteps: IOption<string>[];
  setLinkedExternalSteps: (
    linkedSteps: SetStateAction<IOption<string>[]>
  ) => void;
}

const ExternalStepItem = (props: IExternalStepItemProps) => {
  const { process, linkedExternalSteps, setLinkedExternalSteps } = props;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const steps: IStepWithRelations[] = process?.steps ?? [];

  return (
    <Box>
      <HStack
        width="100%"
        _hover={{ background: primary100 }}
        height={12}
        paddingX={4}
        paddingY={4}
        cursor="pointer"
        fontSize="sm"
        fontWeight={500}
        transition="0.2s ease-in-out"
        justifyContent="space-between"
        onClick={() => setIsCollapsed((isCollapsed) => !isCollapsed)}
      >
        <HStack display="flex" alignItems="center">
          <IconBuilder icon={blockIcon} size={40} isActive />
          <Text
            color={textColorBlack}
            fontSize="sm"
            fontWeight={500}
            paddingLeft={3}
            margin={0}
          >
            {process.name}
          </Text>
        </HStack>
        <HStack>
          {isCollapsed ? (
            <SvgIcon
              iconName="arrow-down-s-line"
              color={colors.black}
              size={20}
            />
          ) : (
            <SvgIcon
              iconName="arrow-right-s-line"
              color={colors.black}
              size={20}
            />
          )}
        </HStack>
      </HStack>
      <Collapse in={isCollapsed} animateOpacity>
        {getValidArray(stepToOptions(steps))?.map(
          (step: IOption<string>, index: number) => {
            return (
              <Box
                key={`external-step-${step?.value ?? index}`}
                padding={0}
                margin={0}
              >
                <StepItem
                  step={step}
                  setLinkedSteps={setLinkedExternalSteps}
                  linkedSteps={linkedExternalSteps}
                  isChildrenStep
                />
              </Box>
            );
          }
        )}
      </Collapse>
    </Box>
  );
};

export default ExternalStepItem;
