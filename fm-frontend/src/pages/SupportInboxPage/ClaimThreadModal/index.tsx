import {
  Button,
  Checkbox,
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
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

interface IClaimThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (isChecked: boolean) => void;
}

const ClaimThreadModal = (props: IClaimThreadModalProps) => {
  const { isOpen, onClose, onSubmit } = props;
  const { authStore, organizationStore } = useStores();
  const { userDetail } = authStore;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const organizationId: string = userDetail?.organizationId ?? "";
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  async function handleSubmit(): Promise<void> {
    setIsLoading(true);
    await onSubmit(isChecked);
    setIsLoading(false);
    onClose();
  }

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen, organizationId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius={8}>
        <ModalHeader fontWeight={500} lineHeight={7} color="gray.800">
          Claim thread?
        </ModalHeader>
        <ModalCloseButton
          background="white"
          border="none"
          boxShadow="none !important"
        />
        <ModalBody paddingX={6} paddingY={2}>
          <VStack
            width="full"
            align="flex-start"
            color="gray.700"
            fontSize="md"
            fontWeight={400}
            lineHeight={6}
            spacing={4}
          >
            <Text>
              You are replying an unclaimed thread. Do you want to claim this
              thread?
            </Text>
            <Checkbox
              isChecked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            >
              Allow automatically claim thread after I reply
            </Checkbox>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack width="full" justify="flex-end">
            <HStack spacing={4}>
              <Button
                variant="outline"
                color="gray.700"
                background="white"
                fontWeight={500}
                lineHeight={6}
                onClick={onClose}
                isLoading={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                fontWeight={500}
                lineHeight={6}
                color="white"
                background={currentTheme?.primaryColor ?? "primary.500"}
                _hover={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                _active={{
                  background: currentTheme?.primaryColor ?? "primary.700",
                  opacity: currentTheme?.primaryColor ? 0.8 : 1,
                }}
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Claim
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default observer(ClaimThreadModal);
