import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { EBreakPoint } from "constants/theme";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IIconBuilder } from "interfaces/iconBuilder";
import { ITheme } from "interfaces/theme";
import { primary500 } from "themes/globalStyles";
import { ReactComponent as CollapseIcon } from "../../../../assets/icons/ic_collapse.svg";
import { ReactComponent as ExpandIcon } from "../../../../assets/icons/ic_expand.svg";
import IconBuilder from "../IconBuilder";

interface IIconBuilderItemProps {
  isOpen: boolean;
  onToggle: () => void;
  handleSelectIconAndOpenModal: (icon: IIconBuilder) => void;
  onOpen: () => void;
  title: string;
  icons: IIconBuilder[];
}

const IconBuilderItem = ({
  isOpen,
  onToggle,
  title,
  onOpen,
  icons = [],
  handleSelectIconAndOpenModal,
}: IIconBuilderItemProps) => {
  const { organizationStore } = useStores();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  return (
    <VStack width="full" backgroundColor="#F7FAFC" borderRadius="8px">
      <HStack
        width="full"
        height="56px"
        backgroundColor="#FFFFFF"
        borderRadius="8px"
      >
        <HStack onClick={onToggle} cursor="pointer">
          <Box>
            <IconButton
              aria-label="Expand Button"
              bg="#FFFFFF"
              border="none"
              _active={{ backgroundColor: "#FFFFFF" }}
              _hover={{ backgroundColor: "#FFFFFF" }}
              icon={isOpen ? <ExpandIcon /> : <CollapseIcon />}
            />
          </Box>
          <Text
            marginLeft="0px"
            whiteSpace="nowrap"
            fontWeight="600"
            fontSize="16px"
            lineHeight="24px"
            color="gray.600"
            paddingRight="8px"
          >
            {title}
          </Text>
          <Text
            marginLeft="16px"
            whiteSpace="nowrap"
            fontSize="16px"
            fontWeight="600"
            lineHeight="24px"
            color="gray.500"
          >
            {icons.length} {isMobile ? "" : icons.length > 1 ? "icons" : "icon"}
          </Text>
        </HStack>

        <Box
          display="flex"
          justifyContent="flex-end"
          width="100%"
          paddingRight="16px"
        >
          <Button
            borderRadius="6px"
            fontSize="14px"
            width={{ base: "unset", md: "134px" }}
            height="32px"
            line-height="20px"
            border="none"
            color="#FFFFFF"
            backgroundColor={currentTheme?.primaryColor ?? primary500}
            _hover={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _focus={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            onClick={onOpen}
          >
            {isMobile ? (
              <AddIcon fontSize="12px" />
            ) : (
              <Flex height={6} alignItems="center">
                <AddIcon fontSize="12px" marginRight="8px" />
                Create Icon
              </Flex>
            )}
          </Button>
        </Box>
      </HStack>
      <Collapse in={isOpen} animateOpacity style={{ width: "100%" }}>
        <HStack
          gap="6"
          spacing="0"
          width="full"
          flexWrap="wrap"
          padding={4}
          alignItems="flex-start"
        >
          {icons.map((icon) => {
            return (
              <IconBuilder
                key={`icon-preview-${icon.id}`}
                icon={icon}
                size={40}
                onClick={() => handleSelectIconAndOpenModal(icon)}
              />
            );
          })}
        </HStack>
      </Collapse>
    </VStack>
  );
};
export default IconBuilderItem;
