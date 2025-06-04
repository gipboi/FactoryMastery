import { CloseIcon } from "@chakra-ui/icons";
import { Box, Radio, Text } from "@chakra-ui/react";
import ProcedureIcon from "components/Common/ProcedureIcon";
import { IDebouncedAsyncMultiSelectProps } from "components/DebouncedAsyncSelect";
import MultiValueRemove from "components/MultiValueRemove";
import SvgIcon from "components/SvgIcon";
import isEmpty from "lodash/isEmpty";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import Select, { components } from "react-select";
import colors from "themes/colors.theme";
import { primary300 } from "themes/globalStyles";
import { BaseStyle } from "types/common";
import styles from "./style.module.scss";

interface IStepFilterSelectProps extends IDebouncedAsyncMultiSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  removeStep: () => void;
}

const Option = (props: any) => {
  const {
    data: { process, collection, displayProcess },
    children,
  } = props;
  const icon = props?.data?.icon;
  const isChecked: boolean = props?.isSelected;

  return (
    <div className={styles.background}>
      {displayProcess && (
        <div className={styles.wrapper}>
          {!isEmpty(collection) && (
            <div>
              <SvgIcon iconName="collections" size={17} />
              <span className={styles.optionLabel}>{process?.name ?? ""}</span>
            </div>
          )}
          <div className={styles.processWrapper}>
            <ProcedureIcon procedureIcon={process.procedureIcon} size={17} />
            <span className={styles.optionLabel}>{process?.name ?? ""}</span>
          </div>
        </div>
      )}
      <div className={styles.stepWrapper}>
        <components.Option {...props} className={styles.option}>
          <Radio
            isChecked={isChecked}
            marginTop={2}
            colorScheme="primary"
            marginRight={4}
          />
          {icon ? (
            <IconBuilder icon={icon} size={24} isActive />
          ) : (
            <SvgIcon
              size={17}
              iconName={"steps"}
              style={{ marginLeft: displayProcess ? 30 : 0 }}
            />
          )}
          <span className={styles.optionName}>{children}</span>
        </components.Option>
      </div>
    </div>
  );
};

const ValueContainer = (props: any) => {
  const { children, hasValue } = props;
  const icon = props?.selectProps?.value?.icon;

  return (
    <div className={styles.valueContainer}>
      <components.ValueContainer {...props}>
        {hasValue && (
          <Box width={6} height={6} alignSelf="center">
            {icon ? (
              <IconBuilder icon={icon} size={24} isActive />
            ) : (
              <SvgIcon size={17} iconName={"steps"} />
            )}
          </Box>
        )}
        <div className={styles.valueChildren}>{children}</div>
      </components.ValueContainer>
    </div>
  );
};

const StepFilterSelect = ({
  placeholder,
  label,
  hasValue,
  removeStep,
  ...rest
}: IStepFilterSelectProps) => {
  return (
    <div>
      <Text
        fontWeight="500"
        fontSize="16px"
        lineHeight="24px"
        color="gray.700"
        marginTop="24px"
        marginBottom="0px"
      >
        {label}
      </Text>
      <Select
        placeholder={placeholder ?? "Select..."}
        components={{
          IndicatorSeparator: null,
          ClearIndicator: () => null,
          MultiValueRemove,
          DropdownIndicator: () =>
            rest.value ? (
              <CloseIcon onClick={removeStep} />
            ) : (
              <SvgIcon size={15} iconName="ic_search" fill={colors.gray[700]} />
            ),
          Option,
          ValueContainer,
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
          option: (base: BaseStyle, props: any) => ({
            ...base,
            color: "gray.700",
            background: props?.isSelected ? primary300 : "white",
          }),
          multiValue: (base: BaseStyle) => ({
            ...base,
            background: "#EEF2F7",
            border: "1px solid #E0E4EA",
            boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.1)",
            borderRadius: 6,
            fontFamily: "Roboto",
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
          indicatorsContainer: (base: BaseStyle) => ({
            ...base,
            marginRight: 16,
          }),
        }}
        {...rest}
      />
    </div>
  );
};

export default StepFilterSelect;
