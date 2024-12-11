import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, MenuButton, useOutsideClick } from "@chakra-ui/react";
import { ITheme } from "interfaces/theme";
import { LegacyRef, useEffect, useRef, useState } from "react";
import { MinWidth, Token, Width } from "types/chakra";
import { IDropdown } from "types/common/select";

interface IDropdownButtonProps {
  item?: IDropdown;
  placeHolder?: string;
  isOpen: boolean;
  minWidth?: Token<MinWidth | number, "sizes">;
  width?: Token<Width | number, "sizes">;
  height?: Token<Width | number, "sizes">;
  isTable?: boolean;
  border?: string;
  fontSize?: string;
  isDisabled?: boolean;
  className?: string;
}

const DropdownButton = (props: IDropdownButtonProps) => {
  const {
    item,
    placeHolder,
    isOpen,
    width,
    isTable,
    height,
    border,
    fontSize,
    isDisabled,
  } = props;
  const itemTitle = item?.title ?? "";
  const menuButtonRef: LegacyRef<HTMLButtonElement> = useRef(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const currentTheme: ITheme = {};

  useOutsideClick({
    ref: menuButtonRef,
    handler: () => setIsFocused(false),
  });

  useEffect(() => {
    if (isOpen) {
      setIsFocused(true);
    }
  }, [isOpen]);

  return (
    <MenuButton
      className={props.className}
      ref={menuButtonRef}
      width={width ?? { base: "400px", lg: "178px" }}
      isActive={isOpen}
      isTruncated
      fontSize={fontSize ?? { base: "lg", lg: "md" }}
      color="gray.700"
      border={border ?? "1px solid #E2E8F0"}
      background="white"
      colorScheme="white"
      fontWeight="normal"
      as={Button}
      iconSpacing={5}
      textAlign={{ base: isTable ? "center" : "left", md: "left" }}
      rightIcon={<ChevronDownIcon boxSize={5} />}
      _focus={{ boxShadow: isFocused ? "outline" : "none" }}
      height={height ?? { base: "48px", lg: "40px" }}
      isDisabled={isDisabled}
      _hover={{
        background: "gray.100",
        opacity: currentTheme?.primaryColor ? 0.8 : 1,
      }}
    >
      {item?.value !== undefined ? itemTitle : placeHolder}
    </MenuButton>
  );
};

export default DropdownButton;
