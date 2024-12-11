import { Box, HStack, Radio, Text } from "@chakra-ui/react";
import concat from "lodash/concat";
import { useEffect, useState } from "react";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { primary100, textColorBlack } from "../../constants";

interface IStepItemProps {
  isChildrenStep?: boolean;
  step: IOption<string>;
  linkedSteps: IOption<string>[];
  setLinkedSteps: (linkedSteps: IOption<string>[]) => void;
}

const StepItem = (props: IStepItemProps) => {
  const { step, setLinkedSteps, linkedSteps, isChildrenStep = false } = props;
  const [isChecked, setIsChecked] = useState<boolean>(false);

  function handleClick() {
    if (!isChecked) {
      setLinkedSteps(concat(linkedSteps, step));
    } else {
      setLinkedSteps(
        getValidArray(linkedSteps)?.filter(
          (linkedStep) => linkedStep?.value !== step?.value
        )
      );
    }
    setIsChecked((isChecked) => !isChecked);
  }

  useEffect(() => {
    const isLinked: boolean = linkedSteps?.some(
      (linkedStep) => linkedStep?.value === step?.value
    );
    setIsChecked(isLinked);
  }, [step]);

  return (
    <Box
      width="100%"
      _hover={{ background: primary100 }}
      height={12}
      padding={4}
      cursor="pointer"
      fontSize="sm"
      fontWeight={500}
      onClick={handleClick}
      transition="0.2s ease-in-out"
      display="flex"
    >
      <HStack display="flex" alignItems="center">
        <Radio
          colorScheme="primary"
          isChecked={isChecked}
          onClick={handleClick}
          paddingLeft={isChildrenStep ? 6 : 0}
          marginTop={2}
        />
        <Text
          color={textColorBlack}
          fontSize="sm"
          fontWeight={500}
          paddingLeft={3}
          margin={0}
        >
          {step.label}
        </Text>
      </HStack>
    </Box>
  );
};

export default StepItem;
