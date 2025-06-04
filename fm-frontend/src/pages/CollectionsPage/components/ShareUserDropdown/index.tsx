import { SearchIcon } from "@chakra-ui/icons";
import {
  FormControl,
  FormLabel,
  HStack,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { IUser } from "interfaces/user";
import last from "lodash/last";
import { Controller, useFormContext } from "react-hook-form";
import { IOption } from "types/common";

export interface IShareUserDropdownProps {
  name: string;
  label: string;
  optionsData: IOption<string>[];
  sharedViaGroupUsers: IUser[];
  chooseOptionsHandler: (value: string) => void;
  placeholder?: string;
}

const ShareUserDropdown = (props: IShareUserDropdownProps) => {
  const {
    name,
    label,
    optionsData,
    placeholder,
    chooseOptionsHandler,
    sharedViaGroupUsers,
  } = props;

  const { control } = useFormContext();

  const CustomOption = (props: any) => {
    const { innerRef, innerProps, data } = props;
    const isSharedViaGroup = sharedViaGroupUsers?.some(
      (user) => String(user?.id) === String(data?.value)
    );

    return (
      <HStack
        ref={innerRef}
        {...innerProps}
        width="full"
        color="gray.700"
        justify="space-between"
        padding="8px 12px"
        opacity={isSharedViaGroup ? 0.5 : 1}
        cursor={isSharedViaGroup ? "not-allowed" : "pointer"}
        _hover={{ background: isSharedViaGroup ? "white" : "gray.100" }}
      >
        <Text fontSize="md">{data?.label ?? ""}</Text>
        {isSharedViaGroup && (
          <Text
            width="max-content"
            fontSize="12px"
            fontWeight="500"
            fontStyle="italic"
          >
            User has been shared via group
          </Text>
        )}
      </HStack>
    );
  };

  return (
    <FormControl width="full" id={name}>
      <FormLabel color="gray.700" fontWeight="500" lineHeight={6} marginY={2}>
        {label}
      </FormLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputGroup
            borderRadius="6px"
            width="full"
            background="white"
            cursor="pointer"
            isolation="unset"
          >
            <Select
              {...field}
              value={null}
              onChange={(options) => {
                if (Array.isArray(options) && options?.length > 0) {
                  chooseOptionsHandler(last(options)?.value ?? "");
                }
              }}
              isSearchable
              isMulti
              options={optionsData}
              placeholder={placeholder}
              closeMenuOnSelect={true}
              components={{
                Option: CustomOption,
                IndicatorSeparator: null,
                DropdownIndicator: () => (
                  <SearchIcon boxSize={5} color="gray.600" mr={2} />
                ),
              }}
              size="md"
              isClearable
              chakraStyles={{
                container: (provided: Record<string, unknown>) => ({
                  ...provided,
                  width: "full",
                  cursor: "pointer",
                }),
                option: (provided: Record<string, unknown>) => ({
                  ...provided,
                  width: "auto",
                  cursor: "pointer",
                }),
                dropdownIndicator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  bg: "transparent",
                  px: 2,
                  cursor: "pointer",
                }),
                indicatorSeparator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  display: "none",
                }),
                clearIndicator: (provided: Record<string, unknown>) => ({
                  ...provided,
                  display: "none",
                }),
                multiValueRemove: (provided: Record<string, unknown>) => ({
                  ...provided,
                  color: "gray.700",
                }),
                placeholder: (provided: Record<string, unknown>) => ({
                  ...provided,
                  padding: "0",
                }),
                menu: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999,
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  boxShadow:
                    "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)",
                }),
                menuList: (provided: Record<string, unknown>) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
          </InputGroup>
        )}
      />
    </FormControl>
  );
};

export default ShareUserDropdown;
