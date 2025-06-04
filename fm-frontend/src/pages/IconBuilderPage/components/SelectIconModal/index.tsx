import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { getValidArray } from "utils/common";
interface ISelectIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconId: string) => Promise<void>;
}
const SelectIconModal = ({
  isOpen,
  onClose,
  onSelect,
}: ISelectIconModalProps) => {
  const { iconBuilderStore } = useStores();
  const { stepIcons, selectedIcon } = iconBuilderStore;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontWeight="500"
            fontSize="18px"
            lineHeight="28px"
            borderBottom="1px solid #E2E8F0"
            color="gray.800"
          >
            Choose Icon
          </ModalHeader>
          <ModalCloseButton
            width="40px"
            height="40px"
            boxShadow="unset"
            border="unset"
            background="#fff"
            _focus={{ borderColor: "unset" }}
            _active={{ borderColor: "unset" }}
          />
          <ModalBody alignItems="flex-start">
            <VStack alignItems="flex-start" spacing={2} paddingY={4}>
              <Text
                fontWeight="500"
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginBottom={0}
              >
                Step Icon
              </Text>
              <HStack
                spacing={0}
                gap={3}
                width="full"
                flexWrap="wrap"
                background="gray.50"
                borderRadius="4px"
                padding={4}
              >
                {getValidArray(stepIcons).map((icon) => {
                  return (
                    <IconBuilder
                      key={`icon-${icon?._id}`}
                      icon={icon}
                      size={40}
                      onClick={() => {
                        iconBuilderStore.setSelectedIcon(icon);
                      }}
                      isActive={selectedIcon?._id === icon?._id}
                    />
                  );
                })}
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4} justifyContent="flex-end" width="full">
              <Button
                variant="outline"
                borderRadius="6px"
                color="gray.700"
                fontSize="16px"
                lineHeight="24px"
                fontWeight="500"
                backgroundColor="#FFFFFF"
                border="1px solid #E2E8F0"
                height="40px"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="danger"
                color="#FFFFFF"
                fontSize="16px"
                lineHeight="24px"
                fontWeight="500"
                backgroundColor="primary.500"
                _hover={{ backgroundColor: "primary.600" }}
                _active={{ backgroundColor: "primary.700" }}
                border="unset"
                height="40px"
                onClick={() => onSelect(selectedIcon?._id ?? "")}
              >
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default observer(SelectIconModal);
