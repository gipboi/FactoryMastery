import { Box } from "@chakra-ui/react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ControllerRenderProps,
  FieldValues,
  UseFormSetValue,
} from "react-hook-form";
import DateRangeInputWithMask, {
  DateRangeValues,
} from "./components/DateRangeInputWithMask";
import { IFilterForm } from "pages/CollectionsPage/components/FilterModal/contants";
dayjs.extend(advancedFormat);

interface CustomInputProps {
  value: string;
  onClick: () => void;
  format: string;
  mask: string[];
  placeholder: string;
  height?: string;
  setIsOpenCalendar: (value: React.SetStateAction<boolean>) => void;
  setValue: UseFormSetValue<FieldValues | IFilterForm>;
  isDisabled?: boolean;
}

interface ICustomDatePickerProps {
  name: string;
  field: ControllerRenderProps<FieldValues, any>;
  dateFormat: string;
  inputMask: string[];
  inputFormat: string;
  inputPlaceholder: string;
  setValue: UseFormSetValue<FieldValues>;
  height?: string;
  isDisabled?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onClick,
  format,
  mask,
  placeholder,
  height,
  setIsOpenCalendar,
  setValue,
  isDisabled,
}) => {
  return (
    <DateRangeInputWithMask
      name="custom-input"
      value={value}
      format={format}
      mask={mask}
      placeholder={placeholder}
      height={height}
      setIsOpenCalendar={setIsOpenCalendar}
      setValue={setValue}
      onClick={onClick}
      isDisabled={isDisabled}
    />
  );
};

export const CustomDateRangePickerWithMask = (
  props: ICustomDatePickerProps
) => {
  const {
    field,
    name,
    inputMask,
    inputFormat,
    inputPlaceholder,
    dateFormat,
    setValue,
    height,
    isDisabled,
  } = props;
  const { onChange, value: dateRangeValues } = field;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleClickOutSide = useCallback(
    (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  function handleOnChange(currentDateRangeValues: DateRangeValues): void {
    onChange(currentDateRangeValues);
  }

  useEffect(() => {
    if (dateRangeValues) {
      const currentStartDate: Date | null = dateRangeValues[0];
      const currentEndDate: Date | null = dateRangeValues[1];

      setStartDate(currentStartDate);
      setEndDate(currentEndDate);
      if (currentStartDate && currentEndDate) {
        setIsOpen(false);
      }
    }
  }, [dateRangeValues]);

  useEffect(() => {
    window.addEventListener("click", handleClickOutSide, true);
    return () => {
      window.removeEventListener("click", handleClickOutSide, true);
    };
  }, [handleClickOutSide]);

  return (
    <Box ref={pickerRef}>
      <DatePicker
        selected={startDate}
        name={name}
        open={isOpen}
        onChange={handleOnChange}
        startDate={startDate}
        endDate={endDate}
        dateFormat={dateFormat}
        customInput={
          <CustomInput
            value={dateRangeValues || ""} // Adjust to your needs
            onClick={() => setIsOpen(true)}
            format={inputFormat}
            mask={inputMask}
            placeholder={inputPlaceholder}
            height={height}
            setIsOpenCalendar={setIsOpen}
            setValue={setValue}
            isDisabled={isDisabled}
          />
        }
        selectsRange
        onInputClick={() => setIsOpen(true)}
      />
    </Box>
  );
};

export default CustomDateRangePickerWithMask;
