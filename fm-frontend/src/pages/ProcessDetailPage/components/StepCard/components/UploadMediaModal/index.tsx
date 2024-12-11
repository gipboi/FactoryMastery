import {
  Box,
  Button,
  Center,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
  Wrap,
} from "@chakra-ui/react";
// import { uploadFile } from "API/cms";
// import { createMedia } from "API/media";
import { MediaFileType, MEDIATYPES } from "components/MediaManager";
import MediaThumbnailWithIcon from "components/MediaThumbnail/components/MediaThumbnailWithIcon";
import SvgIcon from "components/SvgIcon";
import { EMediaThumbnail } from "constants/media";
import { useStores } from "hooks/useStores";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import { observer } from "mobx-react";
import {
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  useRef,
  useState,
} from "react";
import { primary, primary500 } from "themes/globalStyles";
import { getValidArray } from "utils/common";
import { ThumbnailCloseButton } from "../../stepCard.styles";
import UploadingMediaModal from "../UploadingMediaModal";
import { getThumbnailType } from "./utils";
import { UpdateBody } from "types/common";
import { IMedia } from "interfaces/media";
import { uploadFile } from "API/cms";
import { createMedia } from "API/media";

interface IUploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  step: IStepWithRelations;
  fetchData: () => void;
}

const UploadMediaModal = (props: IUploadMediaModalProps) => {
  const { isOpen, onClose, step, organizationId, fetchData } = props;
  const { organizationStore } = useStores();
  const currentTheme: ITheme = organizationStore.organization?.theme ?? {};
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileIndex, setfileIndex] = useState<number>(0);
  const {
    isOpen: isOpenUploadingModal,
    onOpen: onOpenUploadingModal,
    onClose: onCloseUploadingModal,
  } = useDisclosure();
  const fileInputRef = useRef<any>(null);

  function handleChoose(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    if (event.currentTarget.files) {
      const targetFiles: File[] = Array.from(event.currentTarget.files);
      setSelectedFiles([...selectedFiles, ...targetFiles]);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const clipboardItems = event.clipboardData.items;
    const pastedFiles: File[] = [];
    for (let i = 0; i < clipboardItems?.length; i++) {
      const item = clipboardItems[i];
      const file = item.getAsFile();
      if (file) {
        pastedFiles.push(file);
      }
    }
    if (pastedFiles?.length > 0) {
      setSelectedFiles([...selectedFiles, ...pastedFiles]);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const pastedFiles: File[] = Array.from(event.dataTransfer?.files);
    if (pastedFiles?.length > 0) {
      setSelectedFiles([...selectedFiles, ...pastedFiles]);
    }
  }

  function handleRemove(fileIndex: number): void {
    const remainFiles: File[] = selectedFiles.filter(
      (file: File, index: number) => index !== fileIndex
    );
    setSelectedFiles(remainFiles);
  }

  function handleClose(): void {
    onClose();
    onCloseUploadingModal();
    setSelectedFiles([]);
  }

  async function uploadMedia(fileToUpload: File): Promise<void> {
    const category = fileToUpload?.type?.split("/")[0] as MediaFileType;
    const fileType = [MediaFileType.IMAGE, MediaFileType.VIDEO].includes(
      category
    )
      ? category
      : MediaFileType.FILE;
    const url: string = await uploadFile(
      organizationId ?? "",
      fileType,
      fileToUpload
    );
    if (url) {
      const mediaBody: UpdateBody<IMedia> = {
        organizationId,
        position: getValidArray(step?.media).length + 1,
        mediaType: MEDIATYPES[fileType].mediaType,
        stepId: step?.id ?? "",
        url,
        [MEDIATYPES[fileType].column]: url.split("/").pop(),
        originalFile: fileToUpload?.name,
      };
      await createMedia(mediaBody);
    }
  }

  async function onSubmit(): Promise<void> {
    if (selectedFiles?.length > 0) {
      setIsLoading(true);
      onOpenUploadingModal();
      for (let i = 0; i < selectedFiles?.length; i++) {
        setfileIndex(i);
        await uploadMedia(selectedFiles[i]);
      }
      await fetchData();
      handleClose();
      setIsLoading(false);
    }
  }

  return (
    <Modal size="4xl" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxWidth="800px" borderRadius={8}>
        <ModalHeader
          color="gray.800"
          fontSize="18px"
          fontWeight={500}
          lineHeight={7}
        >
          Upload files
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ borderColor: "unset" }}
        />
        <ModalBody borderTop="1px solid #E2E8F0" padding={6}>
          <VStack width="full" align="flex-start" spacing={4}>
            <Text
              color="gray.700"
              fontSize="md"
              fontWeight={500}
              lineHeight={6}
              margin={0}
            >
              Drag, paste or choose to upload files.
            </Text>
            <Center
              width="full"
              height="200px"
              background="white"
              borderRadius="12px"
              border={`2px dashed ${currentTheme?.primaryColor ?? primary500}`}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
            >
              <VStack>
                <Text
                  fontSize="sm"
                  color="gray.400"
                  fontWeight={500}
                  lineHeight={5}
                  margin={0}
                >
                  Drag or paste to clipboard
                </Text>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleChoose}
                  style={{ display: "none" }}
                />
                <Center
                  gap={2}
                  width="235px"
                  height="32px"
                  paddingX={3}
                  color={currentTheme?.primaryColor ?? primary500}
                  background="white"
                  fontSize="14px"
                  fontWeight={500}
                  lineHeight={5}
                  borderRadius={6}
                  border={`1px solid ${currentTheme?.primaryColor ?? primary500}`}
                  _hover={{
                    cursor: "pointer",
                    color: "white",
                    background: currentTheme?.primaryColor ?? primary500,
                    svg: {
                      filter:
                        "invert(34%) sepia(0%) saturate(0%) hue-rotate(12deg) brightness(188%) contrast(111%)",
                    },
                  }}
                  onClick={() => fileInputRef?.current.click()}
                >
                  <SvgIcon
                    color={currentTheme?.primaryColor ?? primary500}
                    iconName="file-upload"
                    size={14}
                  />
                  Choose to upload
                </Center>
              </VStack>
            </Center>
            <Wrap>
              {getValidArray(selectedFiles).map((file: File, index: number) => {
                const category = file?.type.split("/")[0] as MediaFileType;
                const fileType = [
                  MediaFileType.IMAGE,
                  MediaFileType.VIDEO,
                ].includes(category)
                  ? category
                  : MediaFileType.FILE;
                return (
                  <Box
                    border="1px solid #CBD5E0"
                    borderRadius={4}
                    position="relative"
                  >
                    {fileType === MediaFileType.IMAGE && (
                      <Image
                        boxSize="96px"
                        objectFit="contain"
                        borderRadius={4}
                        src={URL.createObjectURL(file)}
                        alt={file?.name}
                      />
                    )}
                    {fileType === MediaFileType.VIDEO && (
                      <MediaThumbnailWithIcon
                        boxSize="96px"
                        borderRadius={4}
                        type={EMediaThumbnail.VIDEO}
                      />
                    )}
                    {fileType === MediaFileType.FILE && (
                      <MediaThumbnailWithIcon
                        boxSize="96px"
                        borderRadius={4}
                        type={getThumbnailType(file)}
                      />
                    )}
                    <ThumbnailCloseButton
                      size="sm"
                      onClick={() => handleRemove(index)}
                    />
                  </Box>
                );
              })}
            </Wrap>
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid #E2E8F0">
          <HStack width="full" justifyContent="flex-end" spacing={4}>
            <Button
              color="gray.700"
              background="white"
              fontSize="16px"
              fontWeight={500}
              lineHeight={6}
              border="1px solid #E2E8F0"
              isLoading={isLoading}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              border="0"
              fontSize="16px"
              fontWeight={500}
              lineHeight={6}
              color="white"
              background={currentTheme?.primaryColor ?? primary500}
              _hover={{
                opacity: "0.8",
                background: currentTheme?.primaryColor ?? primary500,
              }}
              isLoading={isLoading}
              onClick={onSubmit}
            >
              Upload
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
      <UploadingMediaModal
        isOpen={isOpenUploadingModal}
        onClose={onCloseUploadingModal}
        files={selectedFiles}
        uploadingFile={fileIndex}
      />
    </Modal>
  );
};

export default observer(UploadMediaModal);
