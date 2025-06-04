import { Center, Tag, Text, VStack, Wrap } from "@chakra-ui/react";
import CustomInputDropdown from "components/CustomInputDropdown";
import { IOption } from "components/CustomInputDropdown/types";
import SvgIcon from "components/SvgIcon";
import { useStores } from "hooks/useStores";
import { filterValueInArray } from "pages/GroupPage/components/GroupFilterDialog/utils";
import { useEffect, useState } from "react";
import { checkValidArray, getValidArray } from "utils/common";
import { filterRemainItem, getOptionSelect } from "./utils";

interface IFilterDropdownProps<T> {
  name: string;
  label: string;
  placeholder: string;
  isOpenModal: boolean;
  options: T[];
  currentItems: T[];
  selectedOptions: IOption[];
  setSelectedOptions: (value: IOption[]) => void;
}

const FilterDropdown = <T extends { id?: string; name?: string }>(
  props: IFilterDropdownProps<T>
) => {
  const {
    name,
    label,
    placeholder,
    isOpenModal,
    options,
    currentItems,
    selectedOptions,
    setSelectedOptions,
  } = props;
  const { authStore } = useStores();
  const { userDetail } = authStore;
  // const { organizationId } = userDetail;
  const organizationId = userDetail?.organizationId;
  const [optionsData, setOptionsData] = useState<IOption[]>(
    getOptionSelect(options)
  );

  function chooseAvailableOption(value: string): void {
    const selectedItems: IOption | undefined = getValidArray(optionsData).find(
      (option: IOption) => option?.value === value
    );
    if (selectedItems) {
      setSelectedOptions([...getValidArray(selectedOptions), selectedItems]);
    }
  }

  function removeSelectedOption(value: string): void {
    const removedItems: IOption | undefined = getValidArray(
      selectedOptions
    ).find((option: IOption) => option?.value === value);
    if (removedItems) {
      const remainItems: IOption[] = filterValueInArray(value, selectedOptions);
      setSelectedOptions(remainItems);
    }
  }

  function prefillFormData(): void {
    setSelectedOptions(getOptionSelect(currentItems));
  }

  useEffect(() => {
    prefillFormData();
    if (isOpenModal) {
      setOptionsData(getOptionSelect(options));
    }
  }, [isOpenModal, organizationId]);

  useEffect(() => {
    const remainItems = filterRemainItem<T>(options, selectedOptions);
    setOptionsData(getOptionSelect(remainItems));
  }, [selectedOptions]);

  return (
    <VStack width="full" alignItems="flex-start" spacing={3}>
      <CustomInputDropdown
        name={name}
        label={label}
        placeholder={placeholder}
        optionsData={optionsData}
        selectedData={selectedOptions}
        chooseOptionsHandler={chooseAvailableOption}
      />
      <Wrap>
        {getValidArray(selectedOptions).map((option: IOption) => (
          <Tag
            key={option?.value}
            size="lg"
            gap={1}
            color="gray.700"
            border="1px solid #E2E8F0"
          >
            {option?.label}
            <SvgIcon
              size={12}
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
