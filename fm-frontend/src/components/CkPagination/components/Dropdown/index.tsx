import { Menu, MenuList } from "@chakra-ui/react";
import DropdownButton from "components/Dropdown/DropdownButton";
import DropdownSelection from "components/Dropdown/DropdownSelection";
import { Token, Width } from "types/chakra";
import { getValidArray } from "utils/common";

export interface IPageSizeDropdownProps {
  options: number[];
  onChange: (pageSize: number) => void;
  item: number;
  width?: Token<Width | number, "sizes">;
}

const PageSizeDropdown = (props: IPageSizeDropdownProps) => {
  const { options, onChange, item, width } = props;
  return (
    <Menu computePositionOnMount>
      {({ isOpen }) => (
        <>
          <DropdownButton
            placeHolder={`${item} rows`}
            isOpen={isOpen}
            width={width}
            minWidth={width}
          />
          <MenuList zIndex="1001" maxWidth={width} minWidth={width}>
            {getValidArray(options).map((option: number, index: number) => (
              <DropdownSelection
                key={`option-${index}`}
                onClick={() => onChange(option)}
                label={`${option} rows`}
                isSelected={option === item}
                width={width}
              />
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  );
};

export default PageSizeDropdown;
