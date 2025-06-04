import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from "@chakra-ui/react";
import AttachmentSection from "components/AttachmentSection";
import SvgIcon from "components/SvgIcon";
import { useStores } from "hooks/useStores";
import { ICollection } from "interfaces/collection";
import isEmpty from "lodash/isEmpty";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IOption } from "types/common";
import { checkValidArray } from "utils/common";
import { handleUploadMultiple } from "utils/upload";
import styles from "./styles.module.scss";

interface INewSupportMessageModalProps {
  isOpen: boolean;
  refetchThreadList?: () => void;
  openThread?: (thread: any) => void;
  onClose: () => void;
  collection?: ICollection;
  handleShowAutosave?: () => void;
  onFileUpload?: () => void;
}

const SendSupportMessageModal = (props: INewSupportMessageModalProps) => {
  const {
    isOpen,
    refetchThreadList = () => {},
    openThread = () => {},
    onClose,
    collection,
  } = props;
  const { userStore, authStore } = useStores();
  const methods = useForm();
  const { control } = methods;
  const [attachments, setAttachments] = useState<File[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedStep, setSelectedStep] = useState<IOption<string> | null>(
    null
  );
  const fileInputRef = useRef<any>(null);

  const isDisableSend = (isEmpty(attachments) && !messageContent) || processing;

  useEffect(() => {
    setSelectedStep(null);
    setMessageContent('');
    setAttachments([]);
  }, [isOpen]);

  async function onSubmit() {
    try {
      setProcessing(true);
      const userDetail = authStore.userDetail;
      if (userDetail) {
        const { organizationId } = userDetail;
        // const attachmentData = await handleUploadMultiple(
        //   attachments,
        //   organizationId
        // );

        refetchThreadList();
        onClose();
        toast.success('Create new comment successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data.error.message;
      toast.error(errorMessage ?? 'Fail to create new comment');
    } finally {
      setProcessing(false);
    }
  }

  async function handleSelectFile(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      setProcessing(true);
      const arrayOfFiles = Array.from(evt.currentTarget.files);
      // setAttachments([...attachments, arrayOfFiles[0]]);
    }
    setProcessing(false);
  }

  const renderFileList = () => {
    return (
      <ul className={styles.fileDisplayList}>
        {checkValidArray(attachments) && (
          <AttachmentSection
            attachments={attachments}
            setAttachments={setAttachments}
            fileInputRef={fileInputRef}
            isLoading={isLoading}
          />
        )}
      </ul>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontWeight="500"
          fontSize="18px"
          lineHeight="28px"
          color="gray.800"
          borderBottom="1px solid #E2E8F0"
        >
          Comment
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: 'unset' }}
          _active={{ background: '#fff', borderColor: 'unset' }}
        />
        <ModalBody paddingTop="24px" paddingBottom="27px">
          <form>
            <Text
              fontWeight="600"
              fontSize="16px"
              lineHeight="24px"
              color="gray.700"
            >
              <SvgIcon iconName="collections" style={{ marginRight: '10px' }} />
              {collection?.name}
            </Text>
            <Text
              fontWeight="500"
              fontSize="16px"
              lineHeight="24px"
              color="gray.700"
              marginTop="24px"
              marginBottom="8px"
            >
              Comment
            </Text>
            <Textarea
              placeholder="Enter your comment"
              onChange={(event) =>
                setMessageContent(event?.target?.value ?? '')
              }
            />
            <Button
              leftIcon={
                <SvgIcon size={13} iconName="ic_baseline-attach-file" />
              }
              variant="outline"
              background="white"
              border="1px solid #E2E8F0"
              borderRadius="6px"
              color="gray.700"
              fontWeight={500}
              fontSize="16px"
              lineHeight="24px"
              marginTop="24px"
              _hover={{ background: 'whiteAlpha.700' }}
              _active={{ background: 'whiteAlpha.700' }}
              onClick={() => {
                if (!processing) {
                  fileInputRef.current.value = null;
                  fileInputRef.current?.click();
                }
              }}
            >
              Attach file
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSelectFile}
                style={{ display: 'none' }}
                multiple
              />
            </Button>
          </form>
          {!!attachments?.length && renderFileList()}
        </ModalBody>

        <ModalFooter borderTop="1px solid #E2E8F0">
          <Button
            variant="outline"
            background="white"
            border="1px solid #E2E8F0"
            borderRadius="6px"
            color="gray.700"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
            _hover={{ background: 'whiteAlpha.700' }}
            _active={{ background: 'whiteAlpha.700' }}
            onClick={onClose}
            marginRight="16px"
            isLoading={processing}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            background="primary.500"
            borderRadius="6px"
            color="white"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
            _hover={{ background: 'primary.700' }}
            _active={{ background: 'primary.700' }}
            onClick={onSubmit}
            disabled={isDisableSend}
            isLoading={processing}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default observer(SendSupportMessageModal);
