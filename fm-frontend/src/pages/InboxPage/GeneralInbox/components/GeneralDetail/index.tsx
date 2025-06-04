/* eslint-disable max-lines */
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
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import last from 'lodash/last';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';

import { ChevronLeftIcon } from '@chakra-ui/icons';
import { createMessageThreads } from 'API/messages';
import MediaThumbnailWithIcon from 'components/MediaThumbnail/components/MediaThumbnailWithIcon';
import SvgIcon from 'components/SvgIcon';
import { S3FileTypeEnum } from 'constants/aws';
import { EBreakPoint } from 'constants/theme';
import { IGroupMessages, IMessageAttachment } from 'interfaces/message';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkValidArray, getValidArray } from 'utils/common';
import { handleUploadMultiple } from 'utils/upload';
import { getFullName, getName } from 'utils/user';
import { ThumbnailCloseButton } from './generalDetail.styles';
import {
  checkValidAttachment,
  getMediaTypeFromThumbnailType,
  getThumbnailType,
  getValidAttachments,
} from './utils';
import { EMediaThumbnail } from 'constants/media';
import LightBox from 'components/LightBox';
import { IMedia } from 'interfaces/media';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  where,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  limit as firebaseLimit,
  limitToLast,
  arrayUnion,
} from 'firebase/firestore';
import { db } from 'config/firebase';
import { truncate } from 'lodash';

const INITIAL_LIMIT = 20;

const GeneralDetail = ({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { authStore, messageStore, organizationStore, userStore } = useStores();
  const { currentGeneralThreadId, generalMessages, generalMessageThreads } =
    messageStore;
  const { userDetail } = authStore;
  const { currentUser, users } = userStore;
  const { organization } = organizationStore;
  const organizationId = userDetail?.organizationId;
  const currentTheme = organization?.theme ?? {};
  const fileInputRef = useRef<any>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const limit: number = Number(params.get('limit')) || 20;

  const [selectedAttachmentName, setSelectedAttachmentName] =
    useState<string>('');
  const [currentAttachments, setCurrentAttachments] = useState<
    IMessageAttachment[]
  >([]);
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const [content, setComment] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentThread = getValidArray(generalMessageThreads).find(
    (thread) => String(thread?.id) === String(currentGeneralThreadId)
  );

  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);
  const firstMessage = generalMessages?.[0];
  const receiver =
    firstMessage?.userId === currentUser?.id
      ? firstMessage?.receiver
      : firstMessage?.user;

  const latestMessage =
    last(getValidArray(generalMessages)) ?? generalMessages?.[0];

  const imageUrl = userDetail?.image
    ? (userDetail?.organizationId ?? '', userDetail.image)
    : '';

  function handleOpenLightBox(
    selectedAttachment: IMessageAttachment,
    attachmentData: IMessageAttachment[]
  ): void {
    setCurrentAttachments(attachmentData);
    setSelectedAttachmentName(selectedAttachment?.url);
    setShowLightBox(true);
  }

  async function handleUpload(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.currentTarget.files) {
      const targetFiles = Array.from(evt.currentTarget.files);
      setAttachments([...attachments, ...targetFiles]);
    }
  }

  async function handleSend() {
    if (!content && attachments?.length === 0) {
      return;
    }

    setSending(true);
    const attachmentData = await handleUploadMultiple(
      attachments,
      organizationId ?? ''
    );

    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        groupMessageThreadId: currentGeneralThreadId,
        userId: userDetail?.id,
        receiverId:
          firstMessage.userId === userDetail?.id
            ? firstMessage.receiverId
            : firstMessage.userId,
        organizationId,
        isSeen: false,
        content,
        attachments: attachmentData,
        createdAt: serverTimestamp(),
      });

      messageStore.setCurrentGeneralThreadId(
        currentGeneralThreadId,
        docRef.id,
        userDetail?.id!
      );
      setComment('');
      setAttachments([]);
      // messageStore.fetchGeneralMessageThreads(limit, '');
      // messageStore.getMessages();
      setSending(false);
    } catch (error) {
      setSending(false);
      toast.error('Something wrong when send message');
    }
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [generalMessages, currentGeneralThreadId]);

  useEffect(() => {
    if (!currentGeneralThreadId) return;

    try {
      setIsLoading(true);

      // Set up real-time listener for messages in this thread
      const messagesQuery = query(
        collection(db, 'messages'),
        where('groupMessageThreadId', '==', currentGeneralThreadId),
        orderBy('createdAt', 'asc'),
        limitToLast(INITIAL_LIMIT)
      );

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot: any) => {
        const messages: IGroupMessages[] = [];

        querySnapshot.forEach((doc: any) => {
          const messageData = doc.data();
          const receiver = getValidArray(users).find(
            (user) => user.id === messageData.receiverId
          );
          const user = getValidArray(users).find(
            (user) => user.id === messageData.userId
          );
          messages.push({
            id: doc.id,
            ...messageData,
            receiver,
            user,
            createdAt: messageData.createdAt?.toDate() || new Date(),
          } as IGroupMessages);
        });

        messageStore.setGeneralMessages(messages as any);
        setIsLoading(false);

        // Mark the thread as seen when messages are loaded
        if (messages.length > 0) {
          messageStore.markGeneralThreadAsSeen(
            currentGeneralThreadId,
            messages?.splice(-1)?.[0]?.id,
            currentUser?.id!
          );
        }

        setIsLoading(false);
      });

      // Cleanup listener on unmount or when thread ID changes
      scrollToBottom();
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up the query and listener:', error);
      setIsLoading(false);
      // Return an empty cleanup function
      return () => {};
    }
  }, [currentGeneralThreadId]);

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
      borderLeft="1px solid #E2E8F0"
    >
      <HStack
        spacing={0}
        w={'full'}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        {isTablet && (
          <IconButton
            marginLeft={4}
            size="sm"
            border="none"
            borderRadius="6"
            variant="outline"
            aria-label="Status History"
            background="gray.100"
            icon={<ChevronLeftIcon width={6} height={6} />}
            onClick={() => messageStore.setCurrentGeneralThreadId('', '', '')}
          />
        )}
        <Text
          width="100%"
          color="gray.800"
          fontSize="lg"
          fontWeight={600}
          lineHeight={6}
          padding={4}
        >
          {currentThread?.isGroup
            ? currentThread?.name ?? ''
            : truncate(getName(receiver))}
        </Text>
      </HStack>
      <VStack
        width="full"
        height="full"
        justify="space-between"
        align="flex-start"
      >
        <VStack
          ref={messagesContainerRef}
          width="full"
          height="calc(100vh - 350px)"
          align="flex-start"
          overflowY="auto"
          padding={4}
        >
          {getValidArray(generalMessages).map((generalMessage) => {
            const fullName = getFullName(
              generalMessage?.user?.firstName,
              generalMessage?.user?.lastName
            );
            const isMyself: boolean =
              generalMessage?.userId === currentUser?.id;
            return (
              <HStack
                key={generalMessage?.id}
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
                    src={generalMessage?.user.image ?? ''}
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
                      {dayjs(generalMessage?.createdAt).fromNow()}
                    </Text>
                  </HStack>
                  <Text
                    color={isMyself ? 'white' : 'gray.600'}
                    fontSize="14px"
                    fontWeight={400}
                    lineHeight={5}
                    textAlign={isMyself ? 'right' : 'left'}
                  >
                    {generalMessage?.content ?? ''}
                  </Text>
                  {checkValidArray(generalMessage?.attachments) && (
                    <HStack
                      width="full"
                      align="flex-start"
                      wrap="wrap"
                      gap={2}
                      spacing={0}
                      justify={isMyself ? 'flex-end' : 'flex-start'}
                    >
                      {getValidArray(generalMessage?.attachments).map(
                        (attachment) => {
                          const attachmentData = getValidArray(
                            generalMessage?.attachments ?? []
                          );
                          return (
                            <Center
                              width={{ base: 'full', sm: '133px' }}
                              cursor="pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenLightBox(attachment, attachmentData);
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
                    src={generalMessage?.user.image ?? ''}
                  />
                )}
              </HStack>
            );
          })}
        </VStack>
        <VStack
          width="full"
          align="flex-start"
          padding={5}
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
                icon={<SvgIcon iconName="ic_baseline-attach-file" size={20} />}
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
                value={content}
                placeholder="Enter your message"
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => event?.key === 'Enter' && handleSend()}
              />
            </HStack>
            <Button
              border="0"
              color="white"
              fontWeight={500}
              lineHeight={5}
              onClick={handleSend}
              isLoading={sending}
              background={currentTheme?.primaryColor ?? 'primary.500'}
              _hover={{ opacity: 0.8 }}
              disabled={!content && attachments?.length === 0}
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
                    <ThumbnailCloseButton size="sm" onClick={handleRemove} />
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
      </VStack>
      <HStack spacing={0} width="full">
        <LightBox
          mediaList={currentAttachments?.map((a) => {
            return {
              name: a?.name ?? '',
              url: a?.url ?? '',
              mediaType: getMediaTypeFromThumbnailType(
                a.type as EMediaThumbnail
              ),
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
      </HStack>
    </VStack>
  );
};

export default observer(GeneralDetail);
