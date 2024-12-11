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
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { toast } from "react-toastify";
import { deleteDocumentType } from "API/documentType";

interface IDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  closeEditModal: () => void;
  reloadData: () => void;
}
const DeleteModal = ({
  isOpen,
  onClose,
  closeEditModal,
  reloadData,
}: IDeleteModalProps) => {
  const { documentTypeStore } = useStores();
  const { documentTypeDetail } = documentTypeStore;

  async function handleDelete(): Promise<void> {
    try {
      if (!documentTypeDetail?.id) {
        throw new Error("Document type not found");
      } else {
        await deleteDocumentType(documentTypeDetail?.id ?? "");
        reloadData();
      }
      toast.success("Document Type deleted successfully");
      onClose();
      closeEditModal();
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong");
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            color="gray.700"
            fontSize="18px"
            lineHeight="28px"
            fontWeight="700"
          >
            Delete this document type?
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
            <Text
              margin="0"
              color="gray.700"
              fontSize="16px"
              lineHeight="24px"
              fontWeight="400"
            >
              Are you sure you want to delete document type?
            </Text>
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
                backgroundColor="red.500"
                _hover={{ backgroundColor: "red.600" }}
                _active={{ backgroundColor: "red.700" }}
                border="unset"
                height="40px"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default observer(DeleteModal);
