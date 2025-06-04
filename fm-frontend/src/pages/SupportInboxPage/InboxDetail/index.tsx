/* eslint-disable max-lines */
import { ChevronLeftIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Image,
  Input,
  Tag,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import {
  createMessageInSupportThreads,
  deleteSupportMessageThreads,
  editSupportMessageThreads,
} from 'API/messages/support-message';
import { getUserById, updateUserById } from 'API/user';
import ConfirmModal from 'components/Chakra/ConfirmModal';
import ProcedureIcon from 'components/Common/ProcedureIcon';
import MediaThumbnailWithIcon from 'components/MediaThumbnail/components/MediaThumbnailWithIcon';

import Spinner from 'components/Spinner';
import SvgIcon from 'components/SvgIcon';
import { S3FileTypeEnum } from 'constants/aws';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import {
  IMessageAttachment,
  SupportMessageThreadStatus,
} from 'interfaces/message';
import { IUser } from 'interfaces/user';
import includes from 'lodash/includes';
import uniq from 'lodash/uniq';
import { observer } from 'mobx-react';
import IconBuilder from 'pages/IconBuilderPage/components/IconBuilder';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import routes from 'routes';
import {
  checkValidArray,
  getThreadStatusColor,
  getValidArray,
} from 'utils/common';
import { handleUploadMultiple } from 'utils/upload';
import { getFullName } from 'utils/user';
import ClaimThreadModal from '../ClaimThreadModal';
import StatusHistory from '../StatusHistory';
import { ThumbnailCloseButton } from './inboxDetail.styles';
import {
  getCreatorOfProcess,
  getThreadTitle,
  getThumbnailType,
} from './utils';
import { EMediaThumbnail } from 'constants/media';
import { getMediaTypeFromThumbnailType } from 'pages/InboxPage/GeneralInbox/components/GeneralDetail/utils';
import { IMedia } from 'interfaces/media';
import LightBox from 'components/LightBox';
import GlobalSpinner from 'components/GlobalSpinner';
import { getSupportMessageStatus } from '../constants';

dayjs.extend(relativeTime);

interface IInboxDetailProps {
  fetchThreadList: (check?: boolean) => void;
}

const InboxDetail = (props: IInboxDetailProps) => {
  const { fetchThreadList } = props;
  const { authStore, messageStore, organizationStore, userStore } = useStores();
  const {
    currentSupportThreadId,
    selectedSupportThread,
    supportMessages = [],
  } = messageStore;
  const { userDetail } = authStore;
  const { organization } = organizationStore;
  const { currentUser } = userStore;
  const organizationId = userDetail?.organizationId;
  const isMessageFullAccess = userDetail?.isMessageFullAccess;
  const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const isClaimed =
    selectedSupportThread?.status === SupportMessageThreadStatus.CLAIMED;
  const isResolved =
    selectedSupportThread?.status === SupportMessageThreadStatus.RESOLVED;
  const isClaimedByOther =
    (isClaimed || isResolved) &&
    selectedSupportThread?.claimedBy !== userDetail?.id;
  const currentTheme = organization?.theme ?? {};
  const currentColor = currentTheme?.primaryColor ?? 'primary.500';
  const status = selectedSupportThread?.status;
  const navigate = useNavigate();
  const fileInputRef = useRef<any>(null);
  const [comment, setComment] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [selectedAttachmentName, setSelectedAttachmentName] =
    useState<string>('');
  const [currentAttachments, setCurrentAttachments] = useState<
    IMessageAttachment[]
  >([]);
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showStatusHistory, setShowStatusHistory] = useState<boolean>(false);
  const [showClaimThreadModal, setShowClaimThreadModal] =
    useState<boolean>(false);
  const currentUserId = userDetail?.id;
  const participantIds = [
    ...getValidArray(participants).map((user) => user?.id),
    ...getValidArray(supportMessages).map((message) => message?.userId),
  ];

  const isCurrentUserParticipant =
    includes(participantIds, currentUserId) ||
    (status === SupportMessageThreadStatus.CLAIMED &&
      selectedSupportThread?.claimedBy === currentUserId);

  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

  function handleOpenLightBox(
    selectedAttachment: IMessageAttachment,
    attachmentData: IMessageAttachment[]
  ): void {
    setCurrentAttachments(attachmentData);
    setSelectedAttachmentName(selectedAttachment?.url);
    setShowLightBox(true);
  }

  async function handleChangeThreadStatus(
    status: SupportMessageThreadStatus
  ): Promise<void> {
    try {
      setIsEditing(true);
      await editSupportMessageThreads(currentSupportThreadId, {
        status,
        claimedBy: [
          SupportMessageThreadStatus.CLAIMED,
          SupportMessageThreadStatus.RESOLVED,
        ].includes(status)
          ? userDetail?.id
          : '',
      });
      await fetchThreadList();
      await messageStore.getThreadDetail();
      setIsEditing(false);
    } catch (error: any) {
      setIsEditing(false);
      toast.error('Something wrong happened');
    }
  }

  async function handleDeleteThread() {
    try {
      setIsEditing(true);
      await deleteSupportMessageThreads(selectedSupportThread?.id);
      messageStore.resetSelectedThread();
      await fetchThreadList();
      setIsEditing(false);
      setShowDeleteModal(false);
      toast.success('Delete thread successfully');
    } catch (error: any) {
      setIsEditing(false);
      setShowDeleteModal(false);
    }
  }

  async function handleUpload(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      const targetFiles = Array.from(evt.currentTarget.files);
      setAttachments([...attachments, ...targetFiles]);
    }
  }

  async function handleAutoClaimThread(isChecked: boolean) {
    await Promise.all([
      handleChangeThreadStatus(SupportMessageThreadStatus.CLAIMED),
      send(),
    ]);
    if (isChecked) {
      await updateUserById(userDetail?.id ?? '', { isAutoClaimThread: true });
    }
  }

  async function handleSend() {
    if (status === SupportMessageThreadStatus.UNCLAIMED) {
      const user = await getUserById(userDetail?.id ?? '', {
        fields: ['isAutoClaimThread'],
      });
      if (!user?.isAutoClaimThread) {
        setShowClaimThreadModal(true);
        return;
      }
      await Promise.all([
        handleChangeThreadStatus(SupportMessageThreadStatus.CLAIMED),
        send(),
      ]);
    } else {
      await send();
    }
  }

  async function send() {
    if (!comment && attachments?.length === 0) {
      return;
    }

    setSending(true);
    const attachmentData = await handleUploadMultiple(
      attachments,
      organizationId ?? ''
    );
    const body = {
      content: comment ?? '',
      attachments: attachmentData,
      supportThreadId: selectedSupportThread?.id,
      userId: userStore?.currentUser?.id,
    };

    try {
      await createMessageInSupportThreads(selectedSupportThread?.id, body);
      fetchThreadList();
      setComment('');
      setAttachments([]);
      messageStore.getSupportMessages();
      setSending(false);
    } catch (error: any) {
      setSending(false);
      toast.error('Something wrong when send message');
    }
  }

  async function getParticipants() {
    if (Number(selectedSupportThread?.id) === 0) {
      return;
    }
    const stepFilter = {
      include: [
        {
          relation: 'process',
          scope: {
            include: [
              {
                relation: 'collaborators', // INFO: collaborator
              },
            ],
          },
        },
      ],
    };
    const participantList: IUser[] = [];
    const processId: string = selectedSupportThread?.step?.processId ?? '';
    const creator: IUser | null = await getCreatorOfProcess(processId);
    if (creator) {
      participantList.push(creator);
    }
    if (selectedSupportThread?.stepId) {
      // const stepDetails = await getStepDetail(
      //   selectedSupportThread?.stepId ?? " ",
      //   stepFilter
      // );
      // const collaborators = stepDetails?.process?.collaborators ?? []; // Ask Tien
      const collaborators: IUser[] = [];
      participantList.push(...collaborators);
    }

    setParticipants(uniq(participantList));
  }

  async function fetchData(): Promise<void> {
    setIsLoading(true);
    setAttachments([]);
    await messageStore.getSupportMessages();
    await messageStore.getThreadDetail();
    getParticipants();
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [currentSupportThreadId]);

  return (
    <VStack
      position={isTablet ? 'absolute' : 'static'}
      left={0}
      top="72px"
      width={isTablet ? '100%' : '70%'}
      height="100%"
      align="flex-start"
      spacing={0}
      background={isTablet ? 'white' : 'transparent'}
    >
      {isLoading ? (
        <HStack padding={4}>
          <GlobalSpinner />
        </HStack>
      ) : (
        <>
          <VStack
            width="full"
            align="flex-start"
            padding={4}
            borderBottom="1px solid #E2E8F0"
          >
            <HStack width="full" justify="space-between">
              <HStack width="full" maxWidth={isTablet ? '100%' : '70%'}>
                {selectedSupportThread.process &&
                  (selectedSupportThread.process.documentType?.icon ? (
                    <IconBuilder
                      icon={selectedSupportThread.process.documentType?.icon}
                      size={32}
                      isActive
                    />
                  ) : (
                    <ProcedureIcon
                      procedureIcon={
                        selectedSupportThread.process?.procedureIcon
                      }
                      size={32}
                    />
                  ))}
                {selectedSupportThread?.stepId && (
                  <IconBuilder
                    icon={selectedSupportThread.step?.icon}
                    size={32}
                    isActive
                  />
                )}
                {/* {!selectedSupportThread?.subject && (
                  <Center boxSize={8} background="#00A9EB" borderRadius={6}>
                    <SvgIcon
                      id="iconStep"
                      size={16}
                      iconName="outline-message"
                      color="white"
                    />
                  </Center>
                )} */}
                {selectedSupportThread?.subject ? (
                  <Text
                    maxWidth="calc(100% - 160px)"
                    color="gray.700"
                    fontSize="16px"
                    fontWeight={600}
                    lineHeight={6}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {selectedSupportThread?.subject ??
                      selectedSupportThread?.process?.name ??
                      selectedSupportThread?.step?.name}
                  </Text>
                ) : (
                  <HStack maxWidth="calc(100% - 60px)" overflow="hidden">
                    <Tooltip
                      label={getThreadTitle(selectedSupportThread)}
                      fontSize="14px"
                      fontWeight={400}
                      padding={2}
                      shouldWrapChildren
                      background="blackAlpha.700"
                      placement="top"
                      color="white"
                      hasArrow
                      borderRadius="4px"
                    >
                      <Text
                        display="inline-block"
                        maxWidth="100%"
                        color="gray.700"
                        fontSize="16px"
                        fontWeight={600}
                        lineHeight={6}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        cursor="pointer"
                        _hover={{ color: 'primary.500' }}
                        onClick={() => {
                          if (selectedSupportThread?.process?.id) {
                            navigate(
                              routes.processes.processId.value(
                                `${selectedSupportThread?.process?.id}`
                              )
                            );
                          } else {
                            navigate(
                              routes.processes.processId.value(
                                `${selectedSupportThread?.step?.process?.id}?selectedStepId=${selectedSupportThread?.step?.id}`
                              )
                            );
                          }
                        }}
                      >
                        {getThreadTitle(selectedSupportThread)}
                      </Text>
                    </Tooltip>
                  </HStack>
                )}
              </HStack>
              {!isTablet && (
                <HStack>
                  <Tooltip
                    label="Status History"
                    fontSize="14px"
                    fontWeight={400}
                    padding={2}
                    shouldWrapChildren
                    background="blackAlpha.700"
                    placement="top"
                    color="white"
                    hasArrow
                    borderRadius="4px"
                  >
                    <IconButton
                      hidden={isBasicUser && !isMessageFullAccess}
                      size="sm"
                      border="none"
                      borderRadius="6"
                      variant="outline"
                      aria-label="Status History"
                      background="gray.100"
                      icon={<SvgIcon iconName="history" size={16} />}
                      onClick={() => setShowStatusHistory(true)}
                    />
                  </Tooltip>
                  <HStack
                    hidden={
                      // *TODO: Update later
                      // (isBasicUser && !isMessageFullAccess) || 
                      isClaimedByOther
                    }
                  >
                    <Button
                      size="sm"
                      color="gray.700"
                      background="white"
                      fontWeight={500}
                      lineHeight={5}
                      border="1px solid #E2E8F0"
                      hidden={status === SupportMessageThreadStatus.UNCLAIMED}
                      onClick={() =>
                        handleChangeThreadStatus(
                          SupportMessageThreadStatus.UNCLAIMED
                        )
                      }
                      isLoading={isEditing}
                    >
                      Unclaim
                    </Button>
                    {status === SupportMessageThreadStatus.RESOLVED ? (
                      <Button
                        size="sm"
                        border="0"
                        color="white"
                        fontWeight={500}
                        lineHeight={5}
                        background="red.500"
                        _hover={{ opacity: 0.8 }}
                        onClick={() => setShowDeleteModal(true)}
                        isLoading={isEditing}
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        border="0"
                        color="white"
                        fontWeight={500}
                        lineHeight={5}
                        background={currentTheme?.primaryColor ?? 'primary.500'}
                        _hover={{
                          background:
                            currentTheme?.primaryColor ?? 'primary.700',
                          opacity: currentTheme?.primaryColor ? 0.8 : 1,
                        }}
                        _active={{
                          background:
                            currentTheme?.primaryColor ?? 'primary.700',
                          opacity: currentTheme?.primaryColor ? 0.8 : 1,
                        }}
                        isLoading={isEditing}
                        onClick={() =>
                          handleChangeThreadStatus(
                            status === SupportMessageThreadStatus.UNCLAIMED
                              ? SupportMessageThreadStatus.CLAIMED
                              : SupportMessageThreadStatus.RESOLVED
                          )
                        }
                      >
                        {status === SupportMessageThreadStatus.UNCLAIMED
                          ? 'Claim'
                          : 'Resolve'}
                      </Button>
                    )}
                  </HStack>
                </HStack>
              )}
            </HStack>
            <HStack>
              {status !== SupportMessageThreadStatus.ALL && (
                <Tag
                  minWidth="auto"
                  border="1px solid"
                  color={`${getThreadStatusColor(status)}.500`}
                  background={`${getThreadStatusColor(status)}.50`}
                  borderColor={`${getThreadStatusColor(status)}.300`}
                >
                  {getSupportMessageStatus(status)}
                </Tag>
              )}
            </HStack>
            {isTablet && (
              <HStack width="100%" justifyContent="space-between">
                <IconButton
                  size="sm"
                  border="none"
                  borderRadius="6"
                  variant="outline"
                  aria-label="Status History"
                  background="gray.100"
                  icon={<ChevronLeftIcon width={6} height={6} />}
                  onClick={() => messageStore.setCurrentSupportThreadId('')}
                />
                <HStack width="100%" justifyContent="flex-end">
                  <Tooltip
                    label="Status History"
                    fontSize="14px"
                    fontWeight={400}
                    padding={2}
                    shouldWrapChildren
                    background="blackAlpha.700"
                    placement="top"
                    color="white"
                    hasArrow
                    borderRadius="4px"
                  >
                    <IconButton
                      hidden={isBasicUser && !isMessageFullAccess}
                      size="sm"
                      border="none"
                      borderRadius="6"
                      variant="outline"
                      aria-label="Status History"
                      background="gray.100"
                      icon={<SvgIcon iconName="history" size={16} />}
                      onClick={() => setShowStatusHistory(true)}
                    />
                  </Tooltip>
                  <HStack
                    hidden={
                      (isBasicUser && !isMessageFullAccess) || isClaimedByOther
                    }
                  >
                    <Button
                      size="sm"
                      color="gray.700"
                      background="white"
                      fontWeight={500}
                      lineHeight={5}
                      border="1px solid #E2E8F0"
                      hidden={status === SupportMessageThreadStatus.UNCLAIMED}
                      onClick={() =>
                        handleChangeThreadStatus(
                          SupportMessageThreadStatus.UNCLAIMED
                        )
                      }
                      isLoading={isEditing}
                    >
                      Unclaim
                    </Button>
                    {status === SupportMessageThreadStatus.RESOLVED ? (
                      <Button
                        size="sm"
                        border="0"
                        color="white"
                        fontWeight={500}
                        lineHeight={5}
                        background="red.500"
                        _hover={{ opacity: 0.8 }}
                        onClick={() => setShowDeleteModal(true)}
                        isLoading={isEditing}
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        border="0"
                        color="white"
                        fontWeight={500}
                        lineHeight={5}
                        background={currentColor}
                        _hover={{ opacity: 0.8 }}
                        isLoading={isEditing}
                        onClick={() =>
                          handleChangeThreadStatus(
                            status === SupportMessageThreadStatus.UNCLAIMED
                              ? SupportMessageThreadStatus.CLAIMED
                              : SupportMessageThreadStatus.RESOLVED
                          )
                        }
                      >
                        {status === SupportMessageThreadStatus.UNCLAIMED
                          ? 'Claim'
                          : 'Resolve'}
                      </Button>
                    )}
                  </HStack>
                </HStack>
              </HStack>
            )}
          </VStack>
          <VStack
            width="full"
            height="full"
            justify="space-between"
            align="flex-start"
          >
            <VStack
              width="full"
              height="calc(100vh - 400px)"
              align="flex-start"
              overflowY="scroll"
              padding={4}
            >
              {getValidArray(supportMessages).map((supportMessage, index) => {
                const fullName = getFullName(
                  supportMessage?.user?.firstName,
                  supportMessage?.user?.lastName
                );
                const isMyself: boolean =
                  supportMessage?.userId === currentUser?.id;
                return (
                  <HStack
                    key={supportMessage?.id}
                    width="full"
                    align="flex-start"
                    spacing={4}
                    paddingY={2}
                    justifyContent={isMyself ? 'flex-end' : 'flex-start'}
                  >
                    {!isMyself && (
                      <Avatar
                        size="sm"
                        name={fullName}
                        src={supportMessage?.user.image ?? ''}
                      />
                    )}
                    <VStack
                      maxWidth="80%"
                      align={isMyself ? 'flex-end' : 'flex-start'}
                      borderRadius="md"
                      bg={
                        isMyself
                          ? currentTheme?.primaryColor ?? 'primary.500'
                          : 'gray.100'
                      }
                      p={3}
                    >
                      <HStack width="full" justify="space-between">
                        <Text
                          color={isMyself ? 'white' : 'gray.700'}
                          fontSize="16px"
                          fontWeight={600}
                          lineHeight={6}
                        >
                          {fullName}
                        </Text>
                        <Text
                          color={isMyself ? 'whiteAlpha.800' : 'gray.400'}
                          fontSize="14px"
                          fontWeight={500}
                          lineHeight="22px"
                        >
                          {dayjs(supportMessage?.createdAt).fromNow()}
                        </Text>
                      </HStack>
                      {supportMessage?.content && (
                        <Text
                          color={isMyself ? 'white' : 'gray.600'}
                          fontSize="14px"
                          fontWeight={400}
                          lineHeight={5}
                          textAlign={isMyself ? 'right' : 'left'}
                        >
                          {supportMessage?.content}
                        </Text>
                      )}
                      {checkValidArray(supportMessage?.attachments) && (
                        <HStack
                          width="full"
                          align="flex-start"
                          wrap="wrap"
                          gap={2}
                          spacing={0}
                          justify={isMyself ? 'flex-end' : 'flex-start'}
                        >
                          {getValidArray(supportMessage?.attachments).map(
                            (attachment) => {
                              const attachmentData = getValidArray(
                                supportMessage?.attachments ?? []
                              );
                              return (
                                <Center
                                  width={{ base: 'full', sm: '133px' }}
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenLightBox(
                                      attachment,
                                      attachmentData
                                    );
                                  }}
                                >
                                  {[EMediaThumbnail.PHOTO].includes(
                                    attachment?.type
                                  ) ? (
                                    <Image
                                      key={attachment?.name}
                                      width={{ base: 'full', sm: '133px' }}
                                      height="72px"
                                      borderRadius={4}
                                      objectFit="contain"
                                      border="1px solid #CBD5E0"
                                      alt={attachment?.name}
                                      src={attachment?.url}
                                    />
                                  ) : (
                                    <MediaThumbnailWithIcon
                                      key={attachment?.name}
                                      width={{ base: 'full', sm: '133px' }}
                                      height="72px"
                                      borderRadius={4}
                                      objectFit="contain"
                                      border="1px solid #CBD5E0"
                                      type={getThumbnailType(attachment?.name)}
                                    />
                                  )}
                                </Center>
                              );
                            }
                          )}
                        </HStack>
                      )}
                    </VStack>
                    {isMyself && (
                      <Avatar
                        size="sm"
                        name={fullName}
                        src={supportMessage?.user.image ?? ''}
                      />
                    )}
                  </HStack>
                );
              })}
            </VStack>
            {status !== SupportMessageThreadStatus.RESOLVED && (
              <VStack
                width="full"
                height={checkValidArray(attachments) ? '450px' : '73px'}
                align="flex-start"
                padding={4}
                borderTop="1px solid #E2E8F0"
                spacing={0}
              >
                <HStack width="full" justify="space-between" spacing={4}>
                  <HStack width="full">
                    <IconButton
                      variant="outline"
                      background="transparent"
                      aria-label="Attach file"
                      size="md"
                      border="none"
                      borderRadius="50%"
                      _hover={{ background: 'gray.200' }}
                      onClick={() => !sending && fileInputRef.current?.click()}
                      icon={
                        <SvgIcon iconName="ic_baseline-attach-file" size={20} />
                      }
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUpload}
                      style={{ display: 'none' }}
                      multiple
                    />
                    <Input
                      width="full"
                      value={comment}
                      placeholder="Enter your comment"
                      onChange={(event) => setComment(event.target.value)}
                      onKeyDown={(event) =>
                        event?.key === 'Enter' && handleSend()
                      }
                    />
                  </HStack>
                  <Button
                    border="0"
                    color="white"
                    fontWeight={500}
                    lineHeight={5}
                    onClick={handleSend}
                    isLoading={sending}
                    background={currentColor}
                    _hover={{ opacity: 0.8 }}
                    disabled={!comment && attachments?.length === 0}
                  >
                    Send
                  </Button>
                </HStack>
                {checkValidArray(attachments) && (
                  <HStack
                    width="full"
                    align="flex-start"
                    overflowX="scroll"
                    padding={4}
                    gap={4}
                    spacing={0}
                  >
                    {getValidArray(attachments).map((attachment, index) => {
                      function handleRemove() {
                        const temp = [...attachments];
                        temp.splice(index, 1);
                        setAttachments([...temp]);
                      }
                      return (
                        <Box
                          border="1px solid #CBD5E0"
                          borderRadius={4}
                          position="relative"
                        >
                          {attachment?.type?.includes(S3FileTypeEnum.IMAGE) ? (
                            <Image
                              width="72px"
                              height="62px"
                              objectFit="contain"
                              borderRadius={4}
                              alt={attachment?.name}
                              src={URL.createObjectURL(attachment)}
                            />
                          ) : (
                            <MediaThumbnailWithIcon
                              width="72px"
                              height="62px"
                              borderRadius={4}
                              type={getThumbnailType(attachment?.name)}
                            />
                          )}
                          <ThumbnailCloseButton
                            size="sm"
                            onClick={handleRemove}
                          />
                          <Tag
                            size="sm"
                            color="gray.500"
                            paddingX={1}
                            border="1px solid #E2E8F0"
                            position="absolute"
                            bottom={1}
                            right={1}
                            zIndex={2}
                          >
                            {attachment?.type?.includes(S3FileTypeEnum.IMAGE)
                              ? 'Photo'
                              : getThumbnailType(attachment?.name)}
                          </Tag>
                        </Box>
                      );
                    })}
                  </HStack>
                )}
              </VStack>
            )}
          </VStack>
        </>
      )}
      <ClaimThreadModal
        isOpen={showClaimThreadModal}
        onClose={() => setShowClaimThreadModal(false)}
        onSubmit={(isChecked: boolean) => handleAutoClaimThread(isChecked)}
      />
      <ConfirmModal
        titleText="Delete thread?"
        bodyText="Are you sure you want to delete the entire comment thread? This action can not be undo."
        confirmButtonText="Delete"
        confirmButtonColor="red.500"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onClickAccept={handleDeleteThread}
      />
      <StatusHistory
        isOpen={showStatusHistory}
        onClose={() => setShowStatusHistory(false)}
      />
      <LightBox
        mediaList={currentAttachments?.map((a) => {
          return {
            name: a?.name ?? '',
            url: a?.url ?? '',
            mediaType: getMediaTypeFromThumbnailType(a.type as EMediaThumbnail),
          } as IMedia;
        })}
        showModal={showLightBox}
        imageIndex={getValidArray(
          currentAttachments?.map((a) => {
            return {
              name: a?.name ?? '',
              url: a?.url ?? '',
            } as IMedia;
          })
        ).findIndex((media) => media.url === selectedAttachmentName)}
        onCloseModal={() => setShowLightBox(false)}
      />
    </VStack>
  );
};

export default observer(InboxDetail);
