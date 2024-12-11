import React from "react";
import { Controller } from "react-hook-form";
import PropTypes from "prop-types";
import { getValidArray } from "utils/common";
import cx from "classnames";
import { Select } from "@chakra-ui/react";

interface IDropdownFormProps {
  name: string;
  options: { label: string; value: string }[];
  placeholder: string;
  label?: string;
  className?: string;
  control: any;
  rules: any;
}

const DropdownForm = ({
  name,
  control,
  options,
  placeholder,
  label,
  rules,
  className,
}: IDropdownFormProps) => {
  return (
    <div className={cx("dropdown-wrapper", className)}>
      {label && <label className="default-label">{label}</label>}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select {...field} className="dropdown">
            {placeholder && <option value="">{placeholder}</option>}
            {getValidArray(options).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      />
    </div>
  );
};

DropdownForm.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string.isRequired,
  rules: PropTypes.object,
};

DropdownForm.defaultProps = {
  placeholder: "",
  rules: {},
};

export default DropdownForm;
