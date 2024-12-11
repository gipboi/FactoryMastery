import {
  Button,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  VStack,
} from "@chakra-ui/react";
import { updateGroupMemberById } from "API/groups";
import ChakraFormRadioGroup from "components/ChakraFormRadioGroup";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { GroupMemberPermission } from "constants/group";
import { IGroupMember, IGroupMemberDetail } from "interfaces/groups";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { allPermissionOptions } from "../AddMemberModal/constant";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
  groupMember?: IGroupMember;
  groupMemberIds?: string[];
}

interface IGroupForm {
  permission: GroupMemberPermissionEnum;
}

const EditPermissionMemberModal = ({
  isOpen,
  onClose,
  reloadData,
  groupMember,
  groupMemberIds = [],
}: IDetailModalProps) => {
  const permission =
    groupMember?.permission ?? GroupMemberPermissionEnum.VIEWER;
  const method = useForm<IGroupForm>({
    defaultValues: { permission: permission as GroupMemberPermissionEnum },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
  } = method;

  function handleOnClose() {
    onClose();
    reset({});
  }

  async function onSubmit(data: IGroupForm): Promise<void> {
    try {
      if (groupMemberIds.length && !groupMember) {
        await Promise.all(
          groupMemberIds.map((groupMemberId) =>
            updateGroupMemberById(groupMemberId ?? "", {
              permission: data?.permission,
            })
          )
        );
      } else if (groupMember) {
        await updateGroupMemberById(groupMember?._id ?? groupMember?.id ?? "", {
          permission: data?.permission,
        });
      }
      toast.success("Change permission successfully");
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      handleOnClose();
      setTimeout(() => {
        reloadData();
      }, 1000);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} size="xl">
      <ModalOverlay />
      <ModalContent
        borderRadius={8}
        marginTop={0}
        containerProps={{ alignItems: "center" }}
      >
        <ModalHeader
          fontSize="18px"
          lineHeight={7}
          fontWeight="500"
          color="gray.800"
        >
          Edit Member Permission
        </ModalHeader>
        <ModalCloseButton
          width="40px"
          height="40px"
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
          onClick={onClose}
        />
        <FormProvider {...method}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody border="1px solid #E2E8F0" padding={6}>
              <VStack>
                <VStack width="full">
                  <ChakraFormRadioGroup
                    name="permission"
                    label="User Permission"
                    optionsData={allPermissionOptions}
                    reverseRow
                  />
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack justifyContent="flex-start" width="full">
                <HStack spacing={4} justifyContent="flex-end" width="full">
                  <Button
                    color="gray.700"
                    lineHeight={6}
                    border="1px solid #E2E8F0"
                    border-radius="6px"
                    background="white"
                    marginRight={4}
                    paddingY={2}
                    onClick={handleOnClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    paddingY={2}
                    paddingX={4}
                    outline="unset"
                    border="unset"
                    color="white"
                    background="primary.500"
                    _hover={{ background: "primary.700" }}
                    _active={{ background: "primary.700" }}
                    borderRadius="6px"
                    fontWeight={500}
                    fontSize="16px"
                    lineHeight="24px"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    Save
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};
export default EditPermissionMemberModal;
