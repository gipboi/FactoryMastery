import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
  useEffect,
} from 'react';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import SvgIcon from 'components/SvgIcon';
import { FormatInputValueFunction } from 'react-number-format/types/types';

interface IDateRangeInputWithMask {
  // INFO: date range input value has format base on Date Format of react-datepicker
  // Ex: with DateFormat="yyyy/MM/dd" => format value = `yyyy/MM/dd - yyyy/MM/dd`.
  // Ex: 2022/09/15 - 2022/09/18
  value: string;
  name: string;
  mask: string[];
  format: string;
  placeholder: string;
  height?: string;
  isDisabled?: boolean;
  setIsOpenCalendar: Dispatch<SetStateAction<boolean>>;
  setValue: UseFormSetValue<FieldValues>;
  onClick: () => void;
}

export type DateRangeValues = [Date | null, Date | null];

const DateRangeInputWithMask = (props: IDateRangeInputWithMask) => {
  const {
    name,
    value: dateRangeInputValue,
    format,
    mask,
    placeholder,
    height,
    isDisabled,
    setIsOpenCalendar,
    setValue,
    onClick,
  } = props;
  const [inputValue, setInputValue] = useState<string>();

  function onChange(event: FormEvent<HTMLInputElement>): void {
    const currentValue: string = event?.currentTarget?.value;
    const [startDate, endDate]: DateRangeValues =
      convertDateRangeValues(currentValue);

    setInputValue(currentValue);
    // INFO: update form value and reset dateRangePicker
    if (startDate && endDate) {
      setValue(name, [startDate, endDate]);
      setIsOpenCalendar(false);
    }
  }

  function convertDateRangeValues(currentValue: string): DateRangeValues {
    const [startDate, endDate] = currentValue?.split('-');
    const dateRangeValues: DateRangeValues = [null, null];

    if (dayjs(startDate).isValid()) {
      dateRangeValues[0] = dayjs(startDate).toDate();
    }
    if (dayjs(endDate).isValid()) {
      dateRangeValues[1] = dayjs(endDate).toDate();
    }

    return dateRangeValues;
  }

  useEffect(() => {
    if (dateRangeInputValue) {
      setInputValue(dateRangeInputValue);
    }
  }, [dateRangeInputValue]);

  return (
    <InputGroup borderRadius="6px" background="white">
      <InputRightElement pointerEvents="none">
        <SvgIcon iconName="date" width={20} height={20} />
      </InputRightElement>
      <Input
        as={PatternFormat}
        format={format}
        mask={mask}
        placeholder={placeholder}
        height={height}
        value={inputValue}
        autoComplete="off"
        onClick={onClick}
        onChange={onChange}
        isDisabled={isDisabled}
      />
    </InputGroup>
  );
};

export default DateRangeInputWithMask;
