import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import { ReactNode, useState } from "react";
import { primary, primary500 } from "themes/globalStyles";

interface IConfirmModalProps {
  titleText?: string;
  bodyText?: string | ReactNode;
  cancelButtonText?: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  isOpen: boolean;
  onClose: () => void;
  onClickAccept: () => void;
  onClickCancel?: () => void;
}

const ConfirmModal = (props: IConfirmModalProps) => {
  const {
    titleText = "Confirm Changes",
    bodyText = "Are you sure you want to do this?",
    cancelButtonText = "Cancel",
    confirmButtonText = "Confirm",
    confirmButtonColor,
    isOpen,
    onClose,
    onClickAccept,
    onClickCancel,
  } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  async function handleConfirm(): Promise<void> {
    setIsLoading(true);
    await onClickAccept();
    setIsLoading(false);
  }

  async function handleCancel(): Promise<void> {
    setIsLoading(true);
    if (onClickCancel) {
      await onClickCancel();
    }
    onClose();
    setIsLoading(false);
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontSize="lg"
          lineHeight={7}
          color="gray.800"
          fontWeight={700}
        >
          {titleText}
        </ModalHeader>
        <ModalCloseButton
          border="unset"
          boxShadow="unset"
          background="white"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <ModalBody>
          <Text color="gray.700" fontSize="md">
            {bodyText}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray.700"
            fontWeight={500}
            lineHeight={6}
            border="1px solid #E2E8F0"
            borderRadius="6px"
            background="transparent"
            _hover={{ background: "gray.300" }}
            _active={{ background: "gray.400" }}
            marginRight={4}
            paddingY={2}
            onClick={handleCancel}
            isLoading={isLoading}
          >
            {cancelButtonText}
          </Button>
          <Button
            borderRadius="6px"
            fontWeight={500}
            lineHeight={6}
            color="white"
            paddingY={2}
            border="none"
            onClick={handleConfirm}
            backgroundColor={
              confirmButtonColor ?? currentTheme?.primaryColor ?? primary500
            }
            _hover={{ opacity: 0.8 }}
            isLoading={isLoading}
          >
            {confirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
