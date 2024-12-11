import {
  Button,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
} from "@chakra-ui/react";
import { useStores } from "hooks/useStores";
import isEmpty from "lodash/isEmpty";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import colors from "themes/colors.theme";
import { primary } from "themes/globalStyles";
// import { createAudit } from 'API/audit'
// import { uploadMultipleFiles } from 'API/cms'
// import { createEcnSuggestion, createMultipleEcnSuggestionAttachment } from 'API/ecnSuggestion'
import AttachmentTag from "components/AttachmentTag";
import SvgIcon from "components/SvgIcon";
import { AuthRoleNameEnum } from "constants/user";
import { IProcessWithRelations } from "interfaces/process";
import { IStepWithRelations } from "interfaces/step";
import { ITheme } from "interfaces/theme";
import MessageContent from "../MessageView/components/Content";
import StepDetail from "../StepDetail";
import styles from "./styles.module.scss";

interface INewSupportMessageModalProps {
  isOpen: boolean;
  process?: IProcessWithRelations;
  selectedStep: IStepWithRelations;
  onClose: () => void;
}

export interface Attachment {
  name: string;
  url: string;
}

const LeaveCommentModal = (props: INewSupportMessageModalProps) => {
  const { isOpen, selectedStep, process, onClose } = props;
  const {
    userStore,
    authStore,
    notificationStore,
    organizationStore,
  } = useStores();
  // const { ecnSuggestionsForAdmin = [], ecnSuggestionsForBasicUser = [] } =
  //   ecnSuggestionStore;
  const { userDetail } = authStore;
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const fileInputRef = useRef<any>(null);
  const isDisableSend =
    (isEmpty(attachments) && !messageContent) || processing || !selectedStep;
  // const collections = Array.isArray(process?.collections)
  //   ? process?.collections
  //   : [];
  const stepId = selectedStep?.id ?? "";
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};

  useEffect(() => {
    //*INFO: Check if stepId is defined before fetching ECN suggestions to avoid passing undefined to the fetch function
    // if (stepId !== undefined) {
    //   ecnSuggestionStore.fetchEcnSuggestions(stepId, !isBasicUser);
    // }
  }, [stepId]);

  useEffect(() => {
    setMessageContent("");
    setAttachments([]);
  }, [isOpen]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files) {
      setProcessing(true);
      const arrayOfFiles = Array.from(event.currentTarget.files);
      // const uploadingFiles = await uploadMultipleFiles(
      //   organizationStore.organization?.id ?? 0,
      //   "other",
      //   arrayOfFiles
      // );

      setAttachments([
        ...attachments,
        // ...uploadingFiles.map((url: string, idx: number) => ({
        //   url,
        //   name: arrayOfFiles[idx].name,
        // })),
      ]);
    }
    setProcessing(false);
  }

  async function onSubmit() {
    if (!stepId || !userStore?.currentUser?.id) {
      toast.error("Step data or user is not available");
      return;
    }

    try {
      setProcessing(true);
      // const createdEcn = await createEcnSuggestion({
      //   stepId,
      //   userId: userStore.currentUser.id,
      //   createdAt: dayjs().toDate(),
      //   updatedAt: dayjs().toDate(),
      //   isAdminOnly: activeTabIndex === 1,
      //   comment: messageContent,
      // });
      // await createAudit({
      //   action: EAuditAction.NOTE,
      //   auditableId: process?.id,
      //   auditableType: EAuditableType.STANDARD_OPERATING_PROCEDURE,
      // });
      if (Array.isArray(attachments) && attachments.length > 0) {
        // await createMultipleEcnSuggestionAttachment(
        //   attachments.map((attachment) => {
        //     return {
        //       createdAt: dayjs().toDate(),
        //       updatedAt: dayjs().toDate(),
        //       ecnSuggestionId: createdEcn.id,
        //       attachment: attachment.url.split("/").pop(),
        //       originalFile: attachment.name,
        //     };
        //   })
        // );
      }

      // ecnSuggestionStore.fetchEcnSuggestions(stepId, !isBasicUser);
      // notificationStore.aggregateCountNotifications();
      setMessageContent("");
      setAttachments([]);
      toast.success("Create new note successfully");
    } catch (error: any) {
      const errorMessage = error.response?.data.error.message;
      toast.error(errorMessage ?? "Fail to create note");
    } finally {
      setProcessing(false);
    }
  }

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
          Leave Note
        </ModalHeader>
        <ModalCloseButton
          boxShadow="unset"
          border="unset"
          background="white"
          top="15px"
          _focus={{ borderColor: "unset" }}
          _active={{ background: "white", borderColor: "unset" }}
        />
        <ModalBody paddingTop="24px" paddingBottom="27px">
          <StepDetail
            // collections={collections}
            process={process}
            step={selectedStep}
          />
          <form>
            <Tabs
              marginTop="24px"
              onChange={(index) => setActiveTabIndex(index)}
            >
              <TabList borderBottom="none">
                {!isBasicUser && (
                  <Tab
                    backgroundColor="white"
                    borderTop="none"
                    borderLeft="none"
                    borderRight="none"
                    _focus={{
                      background: "white",
                      borderBottom: `2px solid ${
                        currentTheme?.primaryColor ?? primary
                      }`,
                    }}
                    _active={{
                      borderBottom: `2px solid ${
                        currentTheme?.primaryColor ?? primary
                      }`,
                    }}
                    _selected={{
                      color: currentTheme?.primaryColor ?? primary,
                      borderBottom: `2px solid ${
                        currentTheme?.primaryColor ?? primary
                      }`,
                    }}
                  >
                    Admin
                  </Tab>
                )}
              </TabList>

              <TabPanels marginTop="2px">
                <TabPanel padding="0px">
                  <div className={styles.commentDisplay}>
                    <MessageContent
                      // messages={ecnSuggestionsForBasicUser}
                      stepId={stepId}
                    />
                  </div>
                </TabPanel>
                <TabPanel padding="0px">
                  <div className={styles.commentDisplay}>
                    <MessageContent
                      // messages={ecnSuggestionsForAdmin}
                      stepId={stepId}
                    />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </form>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid #E2E8F0"
          justifyContent="space-between"
        >
          <Tooltip
            label="Attach file"
            height="36px"
            fontSize="14px"
            padding={2}
            background="gray.700"
            placement="top"
            color="white"
            hasArrow
            borderRadius="4px"
          >
            <IconButton
              variant="outline"
              colorScheme="transparent"
              aria-label="Attach file"
              size="24px"
              borderRadius="6px"
              border="none"
              marginLeft="15px"
              marginRight="15px"
              onClick={() => {
                !processing && fileInputRef.current?.click();
              }}
              icon={
                <SvgIcon
                  iconName="ic_baseline-attach-file"
                  fill={colors.gray[700]}
                  size={20}
                />
              }
            />
          </Tooltip>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
            multiple
          />
          <Input
            color="black"
            fontSize="16px"
            fontWeight="400"
            lineHeight="24px"
            placeholder="Enter your note"
            variant="outline"
            borderColor="white"
            onChange={(event) => setMessageContent(event?.target?.value)}
            border="1px solid #E2E8F0 !important"
            borderRadius="6px"
            value={messageContent}
            padding="8px 16px"
            marginRight="24px"
            _focus={{ borderColor: "white" }}
            _hover={{ borderColor: "white" }}
          />
          <Button
            variant="outline"
            borderRadius="6px"
            color="white"
            fontWeight={500}
            fontSize="16px"
            lineHeight="24px"
            disabled={isDisableSend}
            background={currentTheme?.primaryColor ?? "primary.500"}
            _hover={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            _active={{
              background: currentTheme?.primaryColor ?? "primary.700",
              opacity: currentTheme?.primaryColor ? 0.8 : 1,
            }}
            onClick={onSubmit}
          >
            Send
          </Button>
        </ModalFooter>
        <div className={styles.attachmentTag}>
          {attachments.map((attach, idx) => (
            <AttachmentTag
              label={attach.name}
              deleteMode
              onDelete={() => {
                const temp = [...attachments];
                temp.splice(idx, 1);
                setAttachments([...temp]);
              }}
              key={idx}
            />
          ))}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default observer(LeaveCommentModal);
