import { Menu, MenuList, Text } from "@chakra-ui/react";
import { Token, Width } from "types/chakra";
import { IDropdown } from "types/common/select";
import { getValidArray } from "utils/common";
import DropdownButton from "./DropdownButton";
import DropdownSelection from "./DropdownSelection";

interface IDropdownProps {
  options: IDropdown[];
  name: string;
  item?: IDropdown;
  setValue: (name: string, value: IDropdown) => void;
  width?: Token<Width | number, "sizes">;
  height?: Token<Width | number, "sizes">;
  maxWidth?: Token<Width | number, "sizes">;
  text?: string;
  isMatchWidth?: boolean;
  isDisabled?: boolean;
  titleDropdown?: string;
  fontSize?: string;
}

const Dropdown = (props: IDropdownProps) => {
  const {
    options,
    name,
    setValue,
    item,
    width,
    maxWidth,
    text,
    isMatchWidth,
    height,
    isDisabled,
    fontSize,
    titleDropdown,
  } = props;
  return (
    <Menu
      closeOnSelect={true}
      autoSelect={false}
      computePositionOnMount
      matchWidth={isMatchWidth}
    >
      {({ isOpen }) => (
        <>
          <DropdownButton
            item={item}
            placeHolder={text}
            isOpen={isOpen}
            width={width}
            height={height}
            isDisabled={isDisabled}
            fontSize={fontSize}
          />
          <MenuList
            zIndex="1001"
            width="full"
            maxWidth={maxWidth}
            minWidth="auto"
            border="1px solid #E2E8F0"
          >
            {titleDropdown && (
              <Text fontSize="xs" paddingX={4} paddingY={1} color="gray.400" width="full">
                {titleDropdown}
              </Text>
            )}
            {getValidArray(options).map((option: IDropdown, index: number) => (
              <DropdownSelection
                key={`${name}-${index}`}
                onClick={() => setValue(name, option)}
                label={option.title}
                isSelected={option.value === item?.value}
                width={width}
                maxWidth={maxWidth}
                height={height}
              />
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  );
};

export default Dropdown;
