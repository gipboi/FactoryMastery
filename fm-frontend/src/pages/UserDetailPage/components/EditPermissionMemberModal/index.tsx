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
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { IGroupMember } from "interfaces/groups";
import { useEffect } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
  member?: IGroupMember;
}

interface IGroupForm {
  permission: GroupMemberPermissionEnum;
}

const EditPermissionMemberModal = ({
  isOpen,
  onClose,
  reloadData,
  member,
}: IDetailModalProps) => {
  const permission = member?.permission ?? GroupMemberPermissionEnum.VIEWER;
  const method = useForm<IGroupForm>();
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
    setValue,
  } = method;
  const permissionWatcher = useWatch({ control, name: "permission" });

  function handleOnClose() {
    onClose();
    reset({});
  }

  async function onSubmit(data: IGroupForm): Promise<void> {
    try {
      if (member) {
        await updateGroupMemberById(member?.id ?? "", {
          permission: data?.permission,
        });
      }
      reloadData();
      toast.success("Change permission successfully");
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      handleOnClose();
    }
  }

  useEffect(() => {
    if (permission) {
      setValue("permission", permission);
    }
  }, [permission]);

  useEffect(() => {
    if (permissionWatcher) {
      setValue("permission", permissionWatcher as GroupMemberPermissionEnum);
    }
  }, [permissionWatcher]);

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} size="2xl">
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
          Edit Permission
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
                <VStack width="full" alignItems="flex-start">
                  <FormLabel
                    fontSize="md"
                    lineHeight={7}
                    fontWeight="500"
                    color="gray.700"
                  >
                    User Permission
                  </FormLabel>
                  <Controller
                    name="permission"
                    control={control}
                    render={({ field }: any) => (
                      <RadioGroup
                        {...field}
                        width="100%"
                        flexDirection="row"
                        display="flex"
                        color="gray.700"
                        fontSize="16px"
                        fontWeight="400"
                        fontStyle="normal"
                      >
                        <Radio
                          flex="1 1 50%"
                          value={GroupMemberPermissionEnum.VIEWER.toString()}
                        >
                          Viewer
                        </Radio>
                        <Radio
                          flex="1 1 50%"
                          value={GroupMemberPermissionEnum.EDITOR.toString()}
                        >
                          Editor
                        </Radio>
                      </RadioGroup>
                    )}
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
