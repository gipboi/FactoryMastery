import { MenuItem } from "@chakra-ui/react";
import colors from "themes/colors.theme";
import { Token, Width } from "types/chakra";

interface IDropdownSelectionProps {
  onClick: () => void;
  label: string | number;
  isSelected?: boolean;
  width?: Token<Width | number, "sizes">;
  minWidth?: Token<Width | number, "sizes">;
  maxWidth?: Token<Width | number, "sizes">;
  isTable?: boolean;
  height?: Token<Width | number, "sizes">;
  fontSize?: Token<Width | number, "fontSizes">;
  color?: string;
  icon?: React.ReactElement;
  children?: React.ReactNode;
}

const DropdownSelection = (props: IDropdownSelectionProps) => {
  const {
    onClick,
    label,
    width,
    minWidth,
    maxWidth,
    isTable,
    height,
    fontSize,
    color,
    icon,
    children,
    isSelected,
  } = props;
  return (
    <MenuItem
      padding="8px 16px"
      width="full"
      minWidth={minWidth}
      maxWidth={maxWidth}
      onClick={onClick}
      className="dropdown-selection"
      background={isSelected ? colors.gray[100] : "white"}
      borderWidth="0"
      outline="none"
      paddingLeft={isTable ? { base: "45px", md: "16px" } : 4}
      height={height ?? { base: "48px", lg: "40px" }}
      fontSize={fontSize ?? { base: "lg", lg: "md" }}
      justifyContent={{ base: "center", md: "flex-start" }}
      color={color ?? "gray.700"}
      icon={icon}
      _hover={{ background: "gray.100" }}
      _focus={{ background: "gray.100" }}
      _active={{ background: "gray.100" }}
    >
      {children ?? label}
    </MenuItem>
  );
};

export default DropdownSelection;
