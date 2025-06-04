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
  Text,
  Tooltip,
} from "@chakra-ui/react";
import SvgIcon from "components/SvgIcon";
import { useStores } from "hooks/useStores";
import { ICollection } from "interfaces/collection";
import { ITheme } from "interfaces/theme";
import isEmpty from "lodash/isEmpty";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import colors from "themes/colors.theme";
import { primary } from "themes/globalStyles";
import { AuthRoleNameEnum } from "constants/user";
import { checkValidArray } from "utils/common";
import styles from "./styles.module.scss";
import { handleUploadMultiple } from "utils/upload";
import AttachmentSection from "components/AttachmentSection";

interface ILeaveNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: ICollection;
}

const LeaveNoteModal = (props: ILeaveNoteModalProps) => {
  const { isOpen, onClose, collection } = props;
  const {
    userStore,
    authStore,

    notificationStore,
    organizationStore,
  } = useStores();
  const { userDetail } = authStore;
  const organizationId = userDetail?.organizationId;
  const currentTheme: ITheme = organizationStore.organization?.theme ?? {};
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const [attachments, setAttachments] = useState<File[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const fileInputRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isDisableSend = (isEmpty(attachments) && !messageContent) || processing;

  useEffect(() => {
    setMessageContent('');
    setAttachments([]);
  }, [isOpen]);

  async function handleUpload(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      const arrayOfFiles = Array.from(evt.currentTarget.files);
      setAttachments((prev) => [...prev, ...arrayOfFiles]);
    }
  }

  async function onSubmit() {
    if (!userStore.currentUser?.id) {
      toast.error('Step data or user is not available');
      return;
    }

    try {
      setProcessing(true);

      let uploadedUrls: string[] = [];

      const attachmentData = await handleUploadMultiple(
        attachments,
        organizationId ?? ""
      );

      setMessageContent("");
      setAttachments([]);
      toast.success('Create comment successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data.error.message;
      toast.error(errorMessage ?? 'Fail to create comment');
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
          _focus={{ borderColor: 'unset' }}
          _active={{ background: 'white', borderColor: 'unset' }}
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
                      background: 'white',
                      borderBottom: '2px solid #00A9EB',
                    }}
                  >
                    Admin
                  </Tab>
                )}
              </TabList>

              <TabPanels marginTop="2px">
                <TabPanel padding="0px">
                  <div className={styles.commentDisplay}></div>
                </TabPanel>
                <TabPanel padding="0px">
                  <div className={styles.commentDisplay}></div>
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
            style={{ display: 'none' }}
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
            _focus={{ borderColor: 'white' }}
            _hover={{ borderColor: 'white' }}
          />
          <Button
            variant="outline"
            color="white"
            background={currentTheme?.primaryColor ?? primary}
            fontWeight={500}
            lineHeight={6}
            disabled={isDisableSend}
            _hover={{
              opacity: 0.8,
              background: currentTheme?.primaryColor ?? primary,
            }}
            onClick={onSubmit}
          >
            Send
          </Button>
        </ModalFooter>
        <div className={styles.attachmentTag}>
          {checkValidArray(attachments) && (
            <AttachmentSection
              attachments={attachments}
              setAttachments={setAttachments}
              fileInputRef={fileInputRef}
              isLoading={isLoading}
            />
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default observer(LeaveNoteModal);
