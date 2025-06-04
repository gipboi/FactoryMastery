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
import { deleteAndAssignDefaultIcon, deleteIcon } from "API/icons";
import { useStores } from "hooks/useStores";
import { EIconType } from "interfaces/iconBuilder";
import { observer } from "mobx-react";
import { useState } from "react";
import { toast } from "react-toastify";
interface IDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  closeEditModal: () => void;
}
const DeleteModal = ({
  isOpen,
  onClose,
  closeEditModal,
}: IDeleteModalProps) => {
  const [value, setValue] = useState("1");
  const { iconBuilderStore } = useStores();
  const { iconDetail } = iconBuilderStore;

  async function handleDelete(): Promise<void> {
    try {
      if (!iconDetail?._id) {
        throw new Error("Icon not found");
      }
      if (iconDetail?.type !== EIconType.DOCUMENT_TYPE || value === "1") {
        await deleteAndAssignDefaultIcon(iconDetail._id);
      } else {
        await deleteIcon(iconDetail?.id ?? "");
      }
      toast.success("Icon deleted successfully");
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
            Delete this icon?
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
              Are you sure you want to delete icon?
            </Text>
            {iconDetail?.type === EIconType.DOCUMENT_TYPE && (
              <Text
                padding="0"
                margin="0"
                color="gray.700"
                fontSize="16px"
                lineHeight="24px"
                fontWeight="400"
              >
                Document types using this icon will be assigned the default icon
              </Text>
              // TODO: Integrate later
              // <VStack alignItems="flex-start" spacing={4}>
              // <Text padding="0" margin="0" color="gray.700" fontSize="16px" lineHeight="24px" fontWeight="400">
              //   What do you prefer to do with Document Type
              //   that use this icon?
              // </Text>
              //   <RadioGroup onChange={setValue} value={value}>
              //     <Stack direction="column">
              //       <Radio value="1" margin="0">
              //         <Text marginBottom="0" color="gray.700" fontSize="16px" lineHeight="24px" fontWeight="400">
              //           Assign the default icon
              //         </Text>
              //       </Radio>
              //       <Radio value="2">
              //         <Text marginBottom="0" color="gray.700" fontSize="16px" lineHeight="24px" fontWeight="400">
              //           Assign a new icon for each on
              //         </Text>
              //       </Radio>
              //     </Stack>
              //   </RadioGroup>
              //   <VStack
              //     marginTop={2}
              //     background="gray.50"
              //     spacing={2}
              //     hidden={value === '1'}
              //     alignItems="flex-start"
              //     maxHeight="50vh"
              //     overflow="auto"
              //     width="full"
              //     padding={4}
              //   >
              //     {getValidArray(iconDetail?.documentTypes).map(item => (
              //       <HStack spacing={4} key={item.id} width="full" alignItems="center">
              //         <IconBuilder icon={iconDetail} isActive size={40} />
              //         <Text marginBottom="0" color="gray.700" fontSize="16px" lineHeight="24px" fontWeight="500">
              //           {item.name}
              //         </Text>
              //       </HStack>
              //     ))}
              //   </VStack>
              // </VStack>
            )}
            {iconDetail?.type === EIconType.BLOCK && (
              <Text
                padding="0"
                margin="0"
                color="gray.700"
                fontSize="16px"
                lineHeight="24px"
                fontWeight="400"
              >
                Blocks using this icon will be assigned the default icon.
              </Text>
            )}
            {iconDetail?.type === EIconType.STEP && (
              <Text
                padding="0"
                margin="0"
                color="gray.700"
                fontSize="16px"
                lineHeight="24px"
                fontWeight="400"
              >
                Steps using this icon will be assigned the default icon.
              </Text>
            )}
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
