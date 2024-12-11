import {
  Box,
  Divider,
  HStack,
  Input,
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
import compact from "lodash/compact";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import colors from "themes/colors.theme";
// import { createManyMedias, dropMediaType } from 'API/media'
import SvgIcon from "components/SvgIcon";
import { MediaType, MediaTypeEnum } from "constants/media";
import { IMedia } from "interfaces/media";
import { IStepWithRelations } from "interfaces/step";
import { getValidArray } from "utils/common";
import CustomButton from "../../../CustomButton";
import { MediaTextFormValues } from "../../enums";
import { StepDefaultId } from "constants/processStep";
import { UpdateBody } from "types/common";
import { get } from "lodash";
import { createManyMedias, dropMediaType } from "API/media";
import { getRenderProcess } from "pages/ProcessDetailPage/utils";
import { observer } from "mobx-react";

interface IEmbedLinkModalProps {
  isOpen: boolean;
  step?: IStepWithRelations;
  mediaList: IMedia[];
  onClose: () => void;
}

const EmbedLinkModal = (props: IEmbedLinkModalProps) => {
  const { isOpen, onClose, step, mediaList } = props;
  const { organizationStore, processStore } = useStores();
  const { control, register, getValues, reset } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: MediaTextFormValues.EMBED_LINK,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function resetForm(): void {
    reset({
      embedLink: compact(
        getValidArray(mediaList).map((media) => {
          if (media?.mediaType === MediaTypeEnum.EMBED) {
            return {
              content: media.url,
            };
          }
          return null;
        })
      ),
    });
  }
  function handleClose(): void {
    resetForm();
    onClose();
  }
  async function handleSave(): Promise<void> {
    setIsLoading(true);
    try {
      await dropMediaType(MediaTypeEnum.EMBED, step?.id ?? StepDefaultId.NONE);
      const listEmbedLinkMedia: UpdateBody<IMedia>[] = compact(
        getValidArray(getValues(MediaTextFormValues.EMBED_LINK)).map(
          (field) => {
            if (step?.id) {
              return {
                organizationId: organizationStore.organization?.id,
                stepId: step.id,
                mediaType: MediaTypeEnum.EMBED,
                url: get(field, "content"),
              };
            }
            return null;
          }
        )
      );
      await createManyMedias(listEmbedLinkMedia);
      toast.success("Embed link saved successfully");
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong");
    }
    setIsLoading(false);
    onClose();
    setTimeout(() => {
      getRenderProcess(step?.processId ?? '', processStore);
    }, 1000);
  }

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent minWidth={{ base: "auto", lg: "600px" }}>
        <ModalHeader
          fontSize="lg"
          fontWeight={500}
          lineHeight={7}
          color="gray.800"
        >
          Embed link
        </ModalHeader>
        <Divider color="gray.200" margin={0} />
        <ModalCloseButton
          background="white"
          border="none"
          boxShadow="none !important"
        />
        <ModalBody padding={6}>
          <VStack spacing={4} alignItems="flex-start">
            <Text
              fontSize="md"
              lineHeight={6}
              fontWeight={500}
              color="gray.700"
              margin={0}
            >
              Link(s)
            </Text>
            {getValidArray(fields).map((field, index: number) => {
              return (
                <HStack
                  key={`field-${field.id}`}
                  justifyContent="space-between"
                  width="full"
                >
                  <Input
                    {...register(
                      `${MediaTextFormValues.EMBED_LINK}.${index}.content`
                    )}
                    placeholder="Enter link"
                    backgroundColor="white"
                    borderRadius="6px"
                  />
                  <Box
                    width={10}
                    height={10}
                    padding="10px"
                    cursor="pointer"
                    onClick={() => remove(index)}
                  >
                    <SvgIcon
                      iconName="ic_close"
                      color={colors.gray[600]}
                      size={12}
                    />
                  </Box>
                </HStack>
              );
            })}
            <Text
              fontSize="sm"
              lineHeight={5}
              fontWeight={500}
              color="gray.600"
              margin={0}
              cursor="pointer"
              onClick={() => append({})}
            >
              + Add new link
            </Text>
          </VStack>
        </ModalBody>
        <Divider color="gray.200" margin={0} />
        <ModalFooter>
          <CustomButton
            content="Cancel"
            className="outline"
            onClick={handleClose}
            isLoading={isLoading}
          />
          <CustomButton
            content="Save"
            className="primary"
            isLoading={isLoading}
            onClick={handleSave}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default observer(EmbedLinkModal);
