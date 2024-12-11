import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import isEmpty from "lodash/isEmpty";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { primary } from "themes/globalStyles";
import { IOption } from "types/common";
// import { createAudit } from 'API/audit'
// import { createSupportMessageThreads } from 'API/messages/support-message'
import AttachmentTag from "components/AttachmentTag";
import SvgIcon from "components/SvgIcon";
import { IProcessWithRelations } from "interfaces/process";
import { ITheme } from "interfaces/theme";
import { getValidArray } from "utils/common";
import StepFilterSelect from "./components/StepFilterSelect";
import styles from "./styles.module.scss";

interface INewSupportMessageModalProps {
  isOpen: boolean;
  process: IProcessWithRelations;
  refetchThreadList?: () => void;
  openThread?: (thread: any) => void;
  onClose: () => void;
}

const SendSupportMessageModal = (props: INewSupportMessageModalProps) => {
  const {
    isOpen,
    refetchThreadList = () => {},
    openThread = () => {},
    onClose,
  } = props;
  const { userStore, authStore, organizationStore } = useStores();
  const methods = useForm();
  const { control, setValue } = methods;
  const [attachments, setAttachments] = useState<File[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState("");
  const stepOptions = (props.process?.steps || []).map((step) => ({
    label: step?.name ?? "",
    value: step?.id,
    icon: step?.icon,
  }));
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  const [selectedStep, setSelectedStep] = useState<IOption<number> | null>(
    null
  );
  const fileInputRef = useRef<any>(null);

  const isDisableSend = (isEmpty(attachments) && !messageContent) || processing;

  const process = props.process;

  useEffect(() => {
    setSelectedStep(null);
    setMessageContent("");
    setAttachments([]);
  }, [isOpen]);

  async function onSubmit() {
    try {
      setProcessing(true);
      // const {
      //   userDetail: { organizationId, id: currentUserId },
      // } = authStore;
      // const attachmentData = await handleUploadMultiple(
      //   attachments,
      //   userStore.currentUser.organizationId
      // );
      // const data = {
      //   organizationId: organizationId,
      //   userId: currentUserId,
      //   ownerId: currentUserId,
      //   content: messageContent,
      //   attachments: attachmentData,
      // };
      // if (selectedStep) {
      //   await createSupportMessageThreads({
      //     ...data,
      //     stepId: selectedStep?.value,
      //   });
      // } else {
      //   await createSupportMessageThreads({ ...data, processId: process?.id });
      // }
      // await createAudit({
      //   action: EAuditAction.COMMENT,
      //   auditableId: process?.id,
      //   auditableType: EAuditableType.STANDARD_OPERATING_PROCEDURE,
      // });
      refetchThreadList();
      onClose();
      toast.success("Create new comment successfully");
    } catch (error: any) {
      const errorMessage = error.response?.data.error.message;
      toast.error(errorMessage ?? "Fail to create new comment");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSelectFile(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      setProcessing(true);
      const arrayOfFiles = Array.from(evt.currentTarget.files);
      setAttachments([...attachments, arrayOfFiles[0]]);
    }
    setProcessing(false);
  }

  function handleRemoveSelectedStep() {
    setSelectedStep(null);
    setValue("step", null);
  }

  const renderFileList = () => {
    return (
      <ul className={styles.fileDisplayList}>
        {getValidArray(attachments).map((attachment, index) => (
          <AttachmentTag
            label={attachment.name}
            deleteMode
            onDelete={() => {
              const temp = [...attachments];
              temp.splice(index, 1);
              setAttachments([...temp]);
            }}
            key={index}
          />
        ))}
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
          Leave Comment
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="#fff"
          _focus={{ borderColor: "unset" }}
          _active={{ background: "#fff", borderColor: "unset" }}
        />
        <ModalBody paddingTop="24px" paddingBottom="27px">
          <form>
            {/* <StepDetail collections={process?.collections} process={process} /> */}
            <Stack>
              <StepFilterSelect
                name="step"
                placeholder="Search step by number or name"
                label="Select step to leave comment (optional)"
                value={selectedStep}
                control={control}
                defaultOptions={[]}
                options={stepOptions}
                removeStep={handleRemoveSelectedStep}
                onChange={(event: any) => {
                  if (selectedStep?.value === event?.value) {
                    setSelectedStep(null);
                  } else {
                    setSelectedStep(event);
                  }
                }}
              />
              {/* <Text
                fontWeight="500"
                fontSize="16px"
                lineHeight="24px"
                color="gray.700"
                marginTop="24px"
                marginBottom="0px"
              >
                Search step by number or name
              </Text>
              <Select
                name="step"
                className="basic-single"
                classNamePrefix="select"
                defaultValue={stepOptions[0]}
                placeholder="Search for step"
                control={control}
                options={stepOptions}
                styles={{
                  input: (base: BaseStyle) => ({
                    ...base,
                    input: {
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '24px'
                    }
                  })
                }}
                components={{
                  IndicatorSeparator: null
                }}
              /> */}
            </Stack>
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
                setMessageContent(event?.target?.value ?? "")
              }
              _focus={{ borderColor: currentTheme?.primaryColor ?? primary }}
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
              _hover={{ background: "whiteAlpha.700" }}
              _active={{ background: "whiteAlpha.700" }}
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
                style={{ display: "none" }}
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
            _hover={{ background: "whiteAlpha.700" }}
            _active={{ background: "whiteAlpha.700" }}
            onClick={onClose}
            marginRight="16px"
            isLoading={processing}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            borderRadius="6px"
            color="white"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
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
