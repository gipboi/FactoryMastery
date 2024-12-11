import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { IIconBuilder } from "interfaces/iconBuilder";
import { ITheme } from "interfaces/theme";
// import IconBuilder from "pages/IconBuilderPage/components/IconBuilder";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { primary } from "themes/globalStyles";
import { useStores } from "../../../../hooks/useStores";
import DeleteModal from "./DeleteModal";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
}

interface IDocumentTypeForm {
  name: string;
  iconId: string;
}

const DetailModal = ({ isOpen, onClose, reloadData }: IDetailModalProps) => {
  const { documentTypeStore, authStore, organizationStore } = useStores();
  const { documentTypeDetail } = documentTypeStore;
  // const { documentTypeIcons } = iconBuilderStore;
  const { userDetail } = authStore;
  const isEdit: boolean = !!documentTypeDetail?.id;
  const method = useForm<IDocumentTypeForm>();
  const [selectedIcon, setSelectedIcon] = useState<IIconBuilder>();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
    reset,
  } = method;
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  function handleOnClose() {
    onClose();
    reset({});
    setSelectedIcon(undefined);
    documentTypeStore.resetStore();
  }

  async function onSubmit(data: IDocumentTypeForm): Promise<void> {
    // if (!selectedIcon) {
    //   toast.error("Please select an icon");
    //   return;
    // }
    try {
      if (!documentTypeDetail?.id) {
        await documentTypeStore.createNewDocumentType({
          name: data?.name ?? "",
          iconId: selectedIcon?.id,
          organizationId: userDetail?.organizationId ?? "",
          iconBuilder: undefined,
        });
      } else {
        await documentTypeStore.updateExistedDocumentType(
          documentTypeDetail.id,
          {
            name: data?.name ?? "",
            iconId: selectedIcon?.id,
            iconBuilder: undefined,
          }
        );
      }
      reloadData();
      handleOnClose();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (documentTypeDetail?.id) {
      reset({ name: documentTypeDetail?.name });
      setSelectedIcon(documentTypeDetail?.iconBuilder);
    }
  }, [documentTypeDetail]);

  useEffect(() => {
    if (!isEdit) {
      reset({ name: "" });
    }
  }, [isOpen, isEdit]);

  // useEffect(() => {
  //   iconBuilderStore.fetchDocumentTypeIconList();
  // }, []);

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
          {isEdit ? "Edit document type" : "Create new document type"}
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
                    Type Name
                  </FormLabel>
                  <Input
                    placeholder="Enter type name"
                    defaultValue={isEdit ? "Work Instructions" : ""}
                    {...register("name", {
                      required: "Name is required",
                    })}
                    _focus={{
                      borderColor: currentTheme?.primaryColor ?? primary,
                    }}
                  />
                </FormControl>
                {/* <FormControl id="icon">
                  <FormLabel marginBottom={2} color="gray.700">
                    Icon
                  </FormLabel>
                  <SimpleGrid
                    columns={{ base: 5, md: 8, lg: 10 }}
                    gap={3}
                    height="full"
                    width="full"
                  >
                    {getValidArray(documentTypeIcons).map((icon) => {
                      return (
                        <IconBuilder
                          key={`icon-${icon?.id}`}
                          icon={icon}
                          size={40}
                          onClick={() => setSelectedIcon(icon)}
                          isActive={selectedIcon?.id === icon?.id}
                        />
                      );
                    })} 
                  </SimpleGrid>
                </FormControl> */}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack justifyContent="flex-start" width="full">
                <Button
                  variant="ghost"
                  color="red.500"
                  fontSize="16px"
                  lineHeight="24px"
                  fontWeight="500"
                  backgroundColor="#FFFFFF"
                  border="unset"
                  height="40px"
                  width="300px"
                  hidden={!documentTypeDetail?.id}
                  onClick={onOpenDelete}
                >
                  Delete Document Type
                </Button>
                <DeleteModal
                  reloadData={reloadData}
                  onClose={onCloseDelete}
                  isOpen={isOpenDelete}
                  closeEditModal={handleOnClose}
                />

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
                    background={currentTheme?.primaryColor ?? "primary.500"}
                    _hover={{
                      background: currentTheme?.primaryColor ?? "primary.700",
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
                    _active={{
                      background: currentTheme?.primaryColor ?? "primary.700",
                      opacity: currentTheme?.primaryColor ? 0.8 : 1,
                    }}
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
export default DetailModal;
