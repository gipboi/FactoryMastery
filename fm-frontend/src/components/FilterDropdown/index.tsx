import { Center, Tag, Text, VStack, Wrap } from "@chakra-ui/react";
import CustomInputDropdown from "components/CustomInputDropdown";
import { useEffect, useState } from "react";
import { IOption } from "types/common";
// import { filterValueInArray } from 'components/Pages/UserPage/UserListFilterDialog/utils'
import SvgIcon from "components/SvgIcon";
import { IAsyncSelectOption } from "interfaces/common";
import { checkValidArray, getValidArray } from "utils/common";
import { filterRemainItem, getOptionSelect } from "./utils";
import { filterValueInArray } from "pages/GroupPage/components/GroupFilterDialog/utils";

interface IFilterDropdownProps<T> {
  isOpenModal: boolean;
  name: string;
  label: string;
  placeholder: string;
  storeOptions: T[];
  filteredOptions: IAsyncSelectOption<string>[];
  selectedOptions: IOption<string>[];
  setSelectedOptions: (value: IOption<string>[]) => void;
  isSelectSingleOption?: boolean;
}

const FilterDropdown = <T extends { id?: string; name?: string }>(
  props: IFilterDropdownProps<T>
) => {
  const {
    isOpenModal,
    name,
    label,
    placeholder,
    storeOptions,
    filteredOptions,
    selectedOptions,
    setSelectedOptions,
    isSelectSingleOption = false
  } = props;
  const [options, setOptions] = useState<IOption<string>[]>(
    getOptionSelect<T>(storeOptions)
  );
  const disabled: boolean = isSelectSingleOption && getValidArray(selectedOptions).length > 0;

  function chooseAvailableOption(value: string) {
    const selectedItems: IOption<string> | undefined = getValidArray(
      options
    ).find((option: IOption<string>) => option?.value === value);
    if (selectedItems) {
      setSelectedOptions([...getValidArray(selectedOptions), selectedItems]);
    }
  }

  function removeSelectedOption(value: string) {
    const removedItems: IOption<string> | undefined = getValidArray(
      selectedOptions
    ).find((option: IOption<string>) => option?.value === value);
    if (removedItems) {
      const remainItems: IOption<string>[] = filterValueInArray(value, selectedOptions)
      setSelectedOptions(remainItems)
    }
  }

  useEffect(() => {
    if (isOpenModal) {
      const filteredItems = getValidArray(filteredOptions).map((option) => ({
        label: option?.label ?? "",
        value: String(option?.value ?? ""),
      }));
      setSelectedOptions(filteredItems);
      setOptions(getOptionSelect<T>(storeOptions));
    }
  }, [isOpenModal, storeOptions?.join(",")]);

  useEffect(() => {
    const remainItems = filterRemainItem<T>(storeOptions, selectedOptions);
    setOptions(getOptionSelect<T>(remainItems));
  }, [selectedOptions?.join(",")]);

  return (
    <VStack width="full" alignItems="flex-start" spacing={3}>
      <CustomInputDropdown
        name={`${name}`}
        label={label}
        placeholder={placeholder}
        optionsData={options}
        selectedData={selectedOptions}
        chooseOptionsHandler={chooseAvailableOption}
        disabled={disabled}
      />
      <Wrap>
        {getValidArray(selectedOptions).map((option) => (
          <Tag
            key={option?.value}
            size="lg"
            gap={1}
            color="gray.700"
            border="1px solid #E2E8F0"
          >
            {option?.label}
            <SvgIcon
              size={14}
              cursor="pointer"
              iconName="ic_baseline-close"
              onClick={() => removeSelectedOption(option?.value)}
            />
          </Tag>
        ))}
        {checkValidArray(selectedOptions) && (
          <Center>
            <Text
              as="u"
              fontSize="md"
              color="gray.600"
              cursor="pointer"
              onClick={() => setSelectedOptions([])}
            >
              Clear all
            </Text>
          </Center>
        )}
      </Wrap>
    </VStack>
  );
};

export default FilterDropdown;
