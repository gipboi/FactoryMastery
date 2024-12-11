import {
  FormControl,
  FormLabel,
  RadioGroup,
  VStack,
  Radio,
} from "@chakra-ui/react";
import { useFormContext, Controller } from "react-hook-form";
import { getValidArray } from "utils/common";
import { IChakraFormRadioGroupProps } from "./types";

const ChakraFormRadioGroup = (props: IChakraFormRadioGroupProps) => {
  const { name, label, optionsData, defaultValue, reverseRow } = props;
  const { control } = useFormContext();

  return (
    <FormControl width="full" id={name}>
      <FormLabel marginBottom={4} color="gray.700">
        {label}
      </FormLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <RadioGroup marginTop={2} {...field}>
            <VStack
              spacing={reverseRow ? 8 : 2}
              alignItems="flex-start"
              flexDirection={reverseRow ? "row" : "column"}
            >
              {getValidArray(optionsData).map((option, index) => {
                return (
                  <Radio
                    key={index}
                    value={String(option?.value)}
                    margin={0}
                    colorScheme="primary"
                  >
                    {option?.label}
                  </Radio>
                );
              })}
            </VStack>
          </RadioGroup>
        )}
      />
    </FormControl>
  );
};

export default ChakraFormRadioGroup;
