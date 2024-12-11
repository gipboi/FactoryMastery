import { Center, useDisclosure } from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { ClipboardEvent, DragEvent, ReactNode, useState } from "react";
import { primary500 } from "themes/globalStyles";
// import { uploadFile } from 'API/cms'
// import { createMedia } from 'API/media'
import { MediaFileType, MEDIATYPES } from "components/MediaManager";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import UploadingMediaModal from "../UploadingMediaModal";
import { uploadFile } from "API/cms";
import { UpdateBody } from "types/common";
import { IMedia } from "interfaces/media";
import { getValidArray } from "utils/common";
import dayjs from "dayjs";
import { createMedia } from "API/media";

interface IDropZoneProps {
  step?: IStepWithRelations;
  organizationId: string;
  fetchData: () => void;
  children?: ReactNode;
}

const DropZone = (props: IDropZoneProps) => {
  const { step, organizationId, fetchData, children } = props;
  const { organizationStore } = useStores();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFile, setUploadingFile] = useState<number>(0);
  const currentTheme: ITheme = organizationStore.organization?.theme ?? {};

  async function uploadMedia(fileToUpload: File) {
    const category = fileToUpload.type.split("/")[0] as MediaFileType;
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
        stepId: step?.id,
        url,
        [MEDIATYPES[fileType].column]: url.split("/").pop(),
        originalFile: fileToUpload?.name,
      };
      await createMedia(mediaBody);
    }
  }

  async function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
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
      setFiles(pastedFiles);
      onOpen();

      for (let i = 0; i < pastedFiles?.length; i++) {
        setUploadingFile(i);
        await Promise.resolve(uploadMedia(pastedFiles[i]));
      }

      await fetchData();
      onClose();
    }
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const fileToUpload: FileList = event.dataTransfer?.files;

    if (fileToUpload?.length > 0) {
      setFiles(Array.from(fileToUpload));
      onOpen();

      for (let i = 0; i < fileToUpload?.length; i++) {
        setUploadingFile(i);
        await Promise.resolve(uploadMedia(fileToUpload[i]));
      }

      await fetchData();
      onClose();
    }
  }

  return (
    <Center
      width="full"
      height="120px"
      color="gray.500"
      background="white"
      borderRadius="12px"
      border={`2px dashed ${currentTheme?.primaryColor ?? primary500}`}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      {children}
      <UploadingMediaModal
        isOpen={isOpen}
        onClose={onClose}
        files={files}
        uploadingFile={uploadingFile}
      />
    </Center>
  );
};

export default observer(DropZone);
