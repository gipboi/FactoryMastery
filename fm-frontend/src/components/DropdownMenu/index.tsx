import cx from "classnames";
import {
  DropdownToggle,
  DropdownMenu as RSDropdownMenu,
  UncontrolledButtonDropdown,
  UncontrolledButtonDropdownProps,
} from "reactstrap";
import styles from "./styles.module.scss";

interface DropdownMenuProps
  extends Omit<UncontrolledButtonDropdownProps, "placeholder"> {
  caret?: boolean;
  placeholder?: any;
  color?: string;
  animated?: boolean;
  // customCaret?: JSX.Element
  customCaret?: React.ReactNode; // Changed from JSX.Element to React.ReactNode
  disabled?: boolean;
}

const DropdownMenu = ({
  className,
  children,
  caret = false,
  placeholder = "",
  color = "primary",
  animated = false,
  customCaret,
  ...props
}: DropdownMenuProps) => {
  return (
    <UncontrolledButtonDropdown
      {...props}
      className={cx(styles.hfDropdownMenu, className)}
    >
      {placeholder ? (
        <DropdownToggle caret={caret} color={color}>
          {placeholder} {customCaret}
        </DropdownToggle>
      ) : null}
      {children ? (
        <RSDropdownMenu
          className={animated ? styles.dropdownMenuAnimated : undefined}
        >
          {children}
        </RSDropdownMenu>
      ) : null}
    </UncontrolledButtonDropdown>
  );
};

export default DropdownMenu;
