import { HStack, Text } from "@chakra-ui/react";
import DebouncedAsyncSelect, {
  IDebouncedAsyncMultiSelectProps,
} from "components/DebouncedAsyncSelect";
import MultiValueRemove from "components/MultiValueRemove";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { components } from "react-select";
import { BaseStyle } from "types/common";

interface IProcessFilterSelectProps extends IDebouncedAsyncMultiSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  hasIcon?: boolean;
}

const ProcessFilterSelect = ({
  placeholder,
  label,
  hasIcon,
  ...rest
}: IProcessFilterSelectProps) => {
  const Option = (props: any) => {
    return (
      <components.Option {...props}>
        <HStack spacing={2} width="full">
          {hasIcon && <IconBuilder icon={props.data.icon} isActive size={32} />}
          <Text>{props.data.label}</Text>
        </HStack>
      </components.Option>
    );
  };
  return (
    <>
      <label>{label}</label>
      <DebouncedAsyncSelect
        isMulti
        placeholder={placeholder ?? "Select..."}
        components={{
          IndicatorSeparator: null,
          ClearIndicator: () => null,
          MultiValueRemove,
          DropdownIndicator: null,
          Option: hasIcon ? Option : components.Option,
        }}
        styles={{
          valueContainer: (base: BaseStyle) => ({
            ...base,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 10,
            paddingRight: 10,
          }),
          input: (base: BaseStyle) => ({
            ...base,
            input: {
              marginBottom: "2px !important",
            },
          }),
          multiValue: (base: BaseStyle) => ({
            ...base,
            background: "#EEF2F7",
            border: "1px solid #E0E4EA",
            boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.1)",
            borderRadius: 6,
            fontFamily: "Inter",
            fontStyle: "normal",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "20px",
            color: "#323A46",
          }),
          multiValueLabel: (base: BaseStyle) => ({
            ...base,
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 8,
            paddingRight: 1,
          }),
          multiValueRemove: (base: BaseStyle) => ({
            ...base,
            cursor: "pointer",
          }),
        }}
        {...rest}
      />
    </>
  );
};

export default ProcessFilterSelect;
