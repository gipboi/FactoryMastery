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
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { primary } from "themes/globalStyles";
import { useStores } from "../../../../hooks/useStores";
import DeleteModal from "../DeleteModal";

interface IDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadData: () => void;
}

interface ITagForm {
  name: string;
  iconId: number;
}

const DetailModal = ({ isOpen, onClose, reloadData }: IDetailModalProps) => {
  const { tagStore, authStore, organizationStore } = useStores();
  const { tagDetail } = tagStore;
  const { userDetail } = authStore;
  const isEdit: boolean = !!tagDetail?.id;
  const method = useForm<ITagForm>();
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
    tagStore.resetStore();
  }

  async function onSubmit(data: ITagForm): Promise<void> {
    try {
      if (!tagDetail?.id) {
        await tagStore.createNewTag({
          name: data?.name ?? "",
          organizationId: userDetail?.organizationId ?? "",
        });
      } else {
        await tagStore.updateExistedTag(tagDetail.id, {
          name: data?.name ?? "",
        });
      }
      reloadData();
      handleOnClose();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (tagDetail?.id) {
      reset({ name: tagDetail?.name });
    }
  }, [tagDetail]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleOnClose}>
        <ModalOverlay zIndex={10000} />
        <ModalContent
          width="800px"
          containerProps={{
            zIndex: 10000,
          }}
        >
          <ModalHeader
            color="gray.800"
            fontSize="18px"
            fontWeight="500"
            lineHeight="28px"
            display="center"
          >
            {isEdit ? "Edit tag" : "Create new tag"}
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
          <FormProvider {...method}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalBody>
                <VStack width="full" alignItems="flex-start">
                  <FormControl id="name">
                    <FormLabel marginBottom={2} color="gray.700">
                      Tag label
                    </FormLabel>
                    <Input
                      placeholder="Enter tag label"
                      defaultValue={isEdit ? "Work Instructions" : ""}
                      {...register("name", {
                        required: "Tag label is required",
                      })}
                      _focus={{
                        borderColor: currentTheme?.primaryColor ?? primary,
                      }}
                    />
                  </FormControl>
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
                    hidden={!tagDetail?.id}
                    onClick={onOpenDelete}
                  >
                    Delete tag
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
                      _focus={{
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
    </>
  );
};
export default observer(DetailModal);
