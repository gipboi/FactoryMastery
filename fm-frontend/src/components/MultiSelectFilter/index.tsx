import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import CustomInputDropdown from "components/CustomInputDropdown";
import { IOption } from "types/common";
import { getValidArray } from "utils/common";
import { ReactComponent as CloseIcon } from "assets/icons/ic_close.svg";
import {
  filterValueInArray,
  findValueInArray,
} from "pages/UserPage/components/UserListFilterDialog/utils";
import { useFormContext } from "react-hook-form";
// import { IOption } from "components/CustomInputDropdown/types.ts";

interface MultiSelectFilterProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: IOption<string>[];
  selectedData: IOption<string>[] | undefined;
  clearAllHandler: () => void;
  disabled?: boolean;
}

const MultiSelectFilter = ({
  name,
  label = "",
  placeholder = "",
  options,
  selectedData,
  clearAllHandler,
  disabled = false,
}: MultiSelectFilterProps) => {
  const methods = useFormContext();
  const { setValue } = methods;
  const filterOptions = getValidArray(options)?.filter((option) =>
    !selectedData?.map((x) => x?.value)?.includes(option?.value)
  );

  function chooseAvailableData(value: string): void {
    const chosenGroup: IOption<string> = findValueInArray(value, options);
    if (chosenGroup) {
      const previousSelectedValues: IOption<string>[] = getValidArray([
        ...getValidArray(selectedData),
        chosenGroup,
      ]);
      setValue(name, previousSelectedValues);
    }
  }

  function removeSelectedGroup(value: string): void {
    const removedGroup: IOption<string> = findValueInArray(
      value,
      getValidArray(selectedData)
    );
    if (removedGroup) {
      const remainGroups: IOption<string>[] = filterValueInArray(
        value,
        getValidArray(selectedData)
      );
      setValue(name, remainGroups);
    }
  }

  return (
    <VStack width="full" alignItems="flex-start">
      <CustomInputDropdown
        name={name}
        label={label}
        placeholder={placeholder}
        optionsData={filterOptions}
        selectedData={selectedData}
        chooseOptionsHandler={chooseAvailableData}
        disabled={disabled}
      />
      <Box width="full" display="flex" flexWrap="wrap">
        {getValidArray(selectedData).map(
          (option: IOption<string>, index: number) => {
            return (
              <HStack
                key={index}
                spacing={2}
                paddingX={3}
                paddingY={2}
                borderRadius="6"
                border="1px solid"
                borderColor="gray.200"
                background="gray.50"
                fontSize="md"
                lineHeight={6}
                fontWeight={500}
                margin={1}
                min-width="fit-content"
              >
                <Text margin={0}>{option.label}</Text>
                <CloseIcon
                  width={12}
                  height={12}
                  cursor="pointer"
                  onClick={() => {
                    removeSelectedGroup(option?.value);
                  }}
                />
              </HStack>
            );
          }
        )}
        {getValidArray(selectedData).length > 0 && (
          <Box display="flex" alignItems="center" margin={2}>
            <Text as="u" margin={0} cursor="pointer" onClick={clearAllHandler}>
              Clear All
            </Text>
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default MultiSelectFilter;
