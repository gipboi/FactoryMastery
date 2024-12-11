import { HStack, Text, VStack } from "@chakra-ui/react";
import cx from "classnames";
import React from "react";
import Select, { Props, components as SelectComponents } from "react-select";
import { IOption, IOptionWithIcon } from "types/common";
// import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder'
import styles from "./dropdownInput.module.scss";

export interface IDropdownInputProps<T> extends Omit<Props, "options"> {
  label?: string;
  options: IOption<T>[] | IOptionWithIcon<T>[];
  defaultValue?: IOption<T>;
  value?: IOption<T> | IOption<T>[];
  isRequired?: boolean;
  hasNoSeparator?: boolean;
  indicatorsContainer?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  autoComplete?: string;
  isSearchable?: boolean;
  hasIcon?: boolean;
}

const DropdownInput = <T,>(props: IDropdownInputProps<T>) => {
  const {
    label,
    isRequired = false,
    hasNoSeparator,
    indicatorsContainer,
    className,
    containerClassName,
    labelClassName,
    isSearchable = true,
    hasIcon = false,
  } = props;
  const components: Record<string, unknown> = {};

  if (hasNoSeparator) {
    components.IndicatorSeparator = null;
  }

  if (indicatorsContainer) {
    components.IndicatorsContainer = () => indicatorsContainer;
  }

  if (hasIcon) {
    components.Option = (optionProps: any) => {
      return (
        <SelectComponents.Option {...optionProps}>
          <HStack spacing={2} width="full">
            {/* {hasIcon && <IconBuilder icon={optionProps?.data?.icon} isActive size={32} />} */}
            <Text>{optionProps?.data?.label ?? ""}</Text>
          </HStack>
        </SelectComponents.Option>
      );
    };
  }

  return (
    <VStack
      className={cx(containerClassName, styles.container)}
      marginTop={!label ? "0 !important" : 2}
    >
      <div className="w-100">
        {label && (
          <span className={cx(styles.fieldLabel, labelClassName)}>{label}</span>
        )}
        {isRequired && <span className={styles.required}> *</span>}
        <Select
          {...props}
          isSearchable={isSearchable}
          className={cx(styles.dropdown, className)}
          components={components}
          menuPlacement="bottom"
          // @ts-ignore
          autoComplete="off"
          styles={{
            menu: (provided) => ({ ...provided, zIndex: 9999 }),
            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
          }}
        />
      </div>
    </VStack>
  );
};

export default DropdownInput;
