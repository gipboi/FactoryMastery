import { useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  HStack,
  VStack,
  Textarea,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { updateGroupById, createGroup } from "API/groups";
import { IGroup } from "interfaces/groups";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
  group?: IGroup | null;
}

interface IGroupForm {
  name: string;
  description: string;
}

const CreateModal = ({
  isOpen,
  onClose,
  reloadData,
  group,
}: IDetailModalProps) => {
  const isEdit: boolean = !!group?.id;
  const { organizationStore } = useStores();
  const { organization } = organizationStore;
  // const currentTheme: ITheme = organization?.theme ?? {}
  const organizationId = organizationStore?.organization?.id ?? "";
  const method = useForm<IGroupForm>({
    defaultValues: {
      name: group?.name ?? "",
      description: group?.description ?? "",
    },
  });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
    reset,
  } = method;

  function handleOnClose() {
    onClose();
    reset({});
  }

  useEffect(() => {
    reset({ name: group?.name ?? "", description: group?.description ?? "" });
  }, [group]);

  async function onSubmit(data: IGroupForm): Promise<void> {
    if (!organizationId) {
      toast.error("Organization not found");
    }
    try {
      if (group && group?.id) {
        await updateGroupById(group?.id ?? "", {
          ...data,
          organizationId: organizationId ?? 0,
        });
        toast.success("Update group successfully");
      } else {
        await createGroup({ ...data, organizationId: organizationId ?? 0 });
        toast.success("Create group successfully");
      }
      reloadData();
      handleOnClose();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  }

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
          {!group ? "Create New Group" : "Group Detail"}
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
              <VStack spacing={6} width="full">
                <FormControl id="name">
                  <FormLabel marginBottom={2} color="gray.700">
                    Group Name
                  </FormLabel>
                  <Input
                    placeholder="Enter type name"
                    {...register("name", {
                      required: "Name is required",
                    })}
                  />
                </FormControl>
                <FormControl id="description">
                  <FormLabel marginBottom={2} color="gray.700">
                    Description (Optional)
                  </FormLabel>
                  <Textarea
                    placeholder="Enter description"
                    {...register("description")}
                  />
                </FormControl>
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
                    background="primary.500"
                    color="white"
                    // backgroundColor={currentTheme?.primaryColor ?? primary}
                    _hover={{ opacity: 0.8 }}
                    _focus={{ opacity: 1 }}
                    _active={{ opacity: 1 }}
                    borderRadius="6px"
                    fontWeight={500}
                    fontSize="16px"
                    lineHeight="24px"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    {isEdit ? "Save" : "Create"}
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
export default CreateModal;
