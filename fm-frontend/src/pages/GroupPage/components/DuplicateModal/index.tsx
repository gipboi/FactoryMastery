import { useState } from "react";
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
import { duplicateGroup } from "API/groups";
import { IGroup } from "interfaces/groups";
import { primary500 } from "../../../../themes/globalStyles";
import Toggle from "components/Toggle";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
  groupToDuplicateFrom: IGroup;
}

interface IGroupForm {
  name: string;
  description: string;
}

const DuplicateModal = ({
  isOpen,
  onClose,
  reloadData,
  groupToDuplicateFrom,
}: IDetailModalProps) => {
  const { organizationStore } = useStores();
  const organizationId = organizationStore?.organization?.id;
  const { organization } = organizationStore;
  // const currentTheme: ITheme = organization?.theme ?? {}
  const method = useForm<IGroupForm>({
    defaultValues: {
      name: groupToDuplicateFrom?.name ?? "",
      description: groupToDuplicateFrom?.description ?? "",
    },
  });
  const [isIncludeMember, setIsIncludeMember] = useState(false);
  const [isIncludeCollection, setIsIncludeCollection] = useState(false);
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

  async function onSubmit(data: IGroupForm): Promise<void> {
    if (!organizationId) {
      toast.error("Organization not found");
    }
    if (!groupToDuplicateFrom?.id) {
      toast.error("Group to duplicate was not found");
    }
    try {
      await duplicateGroup(groupToDuplicateFrom.id ?? "", {
        ...data,
        isDuplicateMember: isIncludeMember,
        isDuplicateProcessAndCollection: isIncludeCollection,
      });
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
          Group Summary
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
                <div style={{ display: "flex", width: "100%" }}>
                  You are duplicating group{" "}
                  <b style={{ marginLeft: 5 }}>
                    {groupToDuplicateFrom?.name ?? ""}
                  </b>
                </div>
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
                    Description (optional)
                  </FormLabel>
                  <Textarea
                    placeholder="Enter description"
                    {...register("description")}
                  />
                </FormControl>
                <Toggle
                  isOn={isIncludeMember}
                  handleToggle={() => setIsIncludeMember(!isIncludeMember)}
                  title="Include all group existing members"
                />
                <Toggle
                  isOn={isIncludeCollection}
                  handleToggle={() =>
                    setIsIncludeCollection(!isIncludeCollection)
                  }
                  title="Include all existing processes and collections"
                />
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
                    backgroundColor={primary500}
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
                    Duplicate
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
export default DuplicateModal;
