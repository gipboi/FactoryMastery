import { Text } from "@chakra-ui/react";
import ProcedureIcon from "components/Common/ProcedureIcon";
import DebouncedAsyncSelect, {
  IDebouncedAsyncMultiSelectProps,
} from "components/DebouncedAsyncSelect";
import MultiValueRemove from "components/MultiValueRemove";
import SvgIcon from "components/SvgIcon";
import isEmpty from "lodash/isEmpty";
import { components } from "react-select";
import { BaseStyle } from "types/common";
import styles from "./style.module.scss";

interface IStepFilterSelectProps extends IDebouncedAsyncMultiSelectProps {
  name: string;
  label: string;
  placeholder?: string;
}

const Option = (props: any) => {
  const {
    data: { process, collection, displayProcess },
    children,
  } = props;

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
          <SvgIcon
            size={17}
            iconName={"steps"}
            style={{ marginLeft: displayProcess ? 30 : 0 }}
          />
          {children}
        </components.Option>
      </div>
    </div>
  );
};

const ValueContainer = (props: any) => {
  const { children, hasValue } = props;

  return (
    <div className={styles.valueContainer}>
      <components.ValueContainer {...props}>
        {hasValue && <SvgIcon size={17} iconName={"steps"} />}
        <div className={styles.valueChildren}>{children}</div>
      </components.ValueContainer>
    </div>
  );
};

const StepFilterSelect = ({
  placeholder,
  label,
  ...rest
}: IStepFilterSelectProps) => {
  return (
    <>
      <Text
        fontWeight="500"
        fontSize="16px"
        lineHeight="24px"
        color="gray.700"
        marginTop="24px"
      >
        {label}
      </Text>
      <DebouncedAsyncSelect
        placeholder={placeholder ?? "Select..."}
        components={{
          IndicatorSeparator: null,
          ClearIndicator: () => null,
          MultiValueRemove,
          DropdownIndicator: null,
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
        }}
        {...rest}
      />
    </>
  );
};

export default StepFilterSelect;
