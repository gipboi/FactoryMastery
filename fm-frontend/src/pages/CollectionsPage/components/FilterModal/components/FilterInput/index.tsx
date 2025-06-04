import { Center, Tag, Text, VStack, Wrap } from "@chakra-ui/react";
import CustomInputDropdown from "components/CustomInputDropdown";
import { useStores } from "hooks/useStores";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { IOption } from "types/common";
// import { filterValueInArray } from 'components/Pages/UserPage/UserListFilterDialog/utils'
import { filterValueInArray } from "pages/GroupPage/components/GroupFilterDialog/utils";

import SvgIcon from "components/SvgIcon";
import { checkValidArray, getValidArray } from "utils/common";
import { ECollectionFilterName } from "../../contants";
import {
  filterCurrentItems,
  filterRemainItem,
  getOptionSelect,
} from "../../utils";

interface IFilterInputProps<T> {
  isOpenModal: boolean;
  name: ECollectionFilterName;
  label: string;
  placeholder: string;
  storeOptions: T[];
  selectedOptions: IOption<string>[];
  setSelectedOptions: (value: IOption<string>[]) => void;
}

const FilterInput = <T extends { id?: string; name?: string }>(
  props: IFilterInputProps<T>
) => {
  const {
    isOpenModal,
    name,
    label,
    placeholder,
    storeOptions,
    selectedOptions,
    setSelectedOptions,
  } = props;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { authStore } = useStores();
  const { userDetail } = authStore;
  const [options, setOptions] = useState<IOption<string>[]>(
    getOptionSelect<T>(storeOptions)
  );
  const organizationId: string = userDetail?.organizationId ?? "";

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
      const remainItems: IOption<string>[] = filterValueInArray(
        value,
        selectedOptions
      );
      setSelectedOptions(remainItems);
    }
  }

  function prefillFormData() {
    const currentItems = filterCurrentItems<T>(params, name, storeOptions);
    setSelectedOptions(getOptionSelect<T>(currentItems));
  }

  useEffect(() => {
    prefillFormData();
    if (isOpenModal) {
      setOptions(getOptionSelect<T>(storeOptions));
    }
  }, [isOpenModal, organizationId]);

  useEffect(() => {
    const remainItems = filterRemainItem<T>(storeOptions, selectedOptions);
    setOptions(getOptionSelect<T>(remainItems));
  }, [selectedOptions]);

  return (
    <VStack width="full" alignItems="flex-start" spacing={3}>
      <CustomInputDropdown
        name={`${name}`}
        label={label}
        placeholder={placeholder}
        optionsData={options}
        selectedData={selectedOptions}
        chooseOptionsHandler={chooseAvailableOption}
      />
      <Wrap>
        {getValidArray(selectedOptions).map((process) => (
          <Tag
            key={process?.value}
            size="lg"
            gap={1}
            color="gray.700"
            border="1px solid #E2E8F0"
          >
            {process?.label}
            <SvgIcon
              iconName="ic_baseline-close"
              size={12}
              cursor="pointer"
              onClick={() => removeSelectedOption(process?.value)}
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

export default FilterInput;
