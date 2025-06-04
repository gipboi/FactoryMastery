import { Avatar, Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { EBreakPoint } from 'constants/theme';
import dayjs from 'dayjs';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import trim from 'lodash/trim';
import truncate from 'lodash/truncate';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import { getName } from 'utils/user';
import GeneralDetail from './components/GeneralDetail';
import GeneralHeader from './components/GeneralHeader';
import GlobalSpinner from 'components/GlobalSpinner';
import {
  collection,
  getDocs,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'config/firebase';
import { IThreadGroup } from 'interfaces/message';
import { MESSAGE_UNSEEN_COLOR } from 'pages/SupportInboxPage/constants';

const GeneralInbox = () => {
  const { messageStore, organizationStore, userStore } = useStores();
  const { generalMessageThreads, currentGeneralThreadId } = messageStore;
  const { organization } = organizationStore;
  const { currentUser, users } = userStore;
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const limit: number = Number(params.get('generalLimit')) || 20;
  const keyword = trim(params.get('generalKeyword') || '');

  const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

  useEffect(() => {
    try {
      const groupMessageThreadQuery = query(
        collection(db, 'groupMessageThreads'),
        where('organizationId', '==', organization?.id),
        where('memberId', 'array-contains', currentUser?.id),
        orderBy('name'),
        orderBy('createdAt', 'asc'),
        limitToLast(limit)
      );

      const unsubscribe = onSnapshot(
        groupMessageThreadQuery,
        async (querySnapshot: any) => {
          try {
            const groupMessageThreads: IThreadGroup[] = [];

            querySnapshot.forEach((doc: any) => {
              const groupMessageThreadData = doc.data();

              if (
                groupMessageThreadData?.name
                  ?.toLowerCase()
                  ?.includes(keyword?.toLowerCase())
              ) {
                groupMessageThreads.push({
                  id: doc.id,
                  ...groupMessageThreadData,
                  groupMessages: [],
                } as IThreadGroup);
              }
            });

            // Now fetch related messages for each thread
            for (const thread of groupMessageThreads) {
              try {
                const messagesQuery = query(
                  collection(db, 'messages'),
                  where('groupMessageThreadId', '==', thread.id),
                  orderBy('createdAt', 'asc')
                );

                const messagesSnapshot = await getDocs(messagesQuery);
                const messages: any[] = [];

                messagesSnapshot.forEach((messageDoc) => {
                  try {
                    const messageData = messageDoc.data();
                    const receiver = getValidArray(users).find(
                      (user) => user.id === messageData.receiverId
                    );
                    const user = getValidArray(users).find(
                      (user) => user.id === messageData.userId
                    );
                    messages.push({
                      id: messageDoc.id,
                      ...messageData,
                      receiver,
                      user,
                      createdAt: messageData.createdAt?.toDate() || new Date(),
                    });
                  } catch (messageProcessError) {
                    console.error(
                      'Error processing message:',
                      messageProcessError
                    );
                    // Continue with the next message
                  }
                });

                thread.groupMessages = messages;
              } catch (threadMessagesError) {
                console.error(
                  `Error fetching messages for thread ${thread.id}:`,
                  threadMessagesError
                );
                // Set empty messages array and continue with the next thread
                thread.groupMessages = [];
              }
            }

            messageStore.setGeneralMessageThreads(groupMessageThreads as any);
            groupMessageThreads?.[0]?.id &&
              !currentGeneralThreadId &&
              !isTablet &&
              messageStore.setCurrentGeneralThreadId(
                groupMessageThreads?.[0]?.id,
                '',
                currentUser?.id!
              );
            setIsLoading(false);
          } catch (snapshotProcessingError) {
            console.error(
              'Error processing query snapshot:',
              snapshotProcessingError
            );
            messageStore.setGeneralMessageThreads([]);
            setIsLoading(false);
          }
        },
        (onSnapshotError) => {
          console.error('Error in onSnapshot listener:', onSnapshotError);
          messageStore.setGeneralMessageThreads([]);
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up the query and listener:', error);
      setIsLoading(false);
      return () => {};
    }
  }, [
    keyword,
    limit,
    isTablet,
    organization?.id,
    currentUser?.id,
    users.length,
    currentGeneralThreadId,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    const currentRef = containerRef.current;
    currentRef?.addEventListener('scroll', handleScroll);
    return () => {
      currentRef?.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef.current, limit]);

  return (
    <VStack width="full" height="full" spacing={0}>
      <GeneralHeader />
      {isLoading && <GlobalSpinner />}
      {generalMessageThreads?.length === 0 && !isLoading ? (
        <VStack width="full" background="white" padding={6}>
          <Text color="gray.700" fontSize="lg" fontWeight={500} lineHeight={6}>
            Your inbox is empty.
          </Text>
          <Text color="gray.700" fontSize="lg" fontWeight={500} lineHeight={6}>
            Messages will appear here once someone inbox.
          </Text>
        </VStack>
      ) : (
        <HStack
          width="full"
          height="full"
          align="flex-start"
          background="white"
          borderRadius={8}
          spacing={0}
          hidden={isLoading}
        >
          <VStack
            height="calc(100vh - 230px)"
            width={isTablet ? '100%' : '30%'}
            maxHeight="100%"
            overflowY="auto"
            overflowX="hidden"
            padding={4}
            spacing={1}
          >
            {getValidArray(generalMessageThreads).map(
              (generalMessageThread) => {
                const id = generalMessageThread?.id;
                const firstMessage = generalMessageThread?.groupMessages?.[0];
                const latestMessage =
                  last(generalMessageThread?.groupMessages) ??
                  generalMessageThread?.groupMessages?.[0];

                const isSeen =
                  currentUser?.id &&
                  latestMessage?.seenBy?.includes(currentUser?.id);
                const receiver =
                  firstMessage?.receiverId === currentUser?.id
                    ? firstMessage?.user
                    : firstMessage?.receiver;
                let previewMessage = latestMessage?.content ?? '';
                if (!previewMessage && !isEmpty(latestMessage?.attachments)) {
                  previewMessage = 'sent an attachment(s)';
                }
                const isActive = id === currentGeneralThreadId;
                const threadName: string = generalMessageThread?.isGroup
                  ? generalMessageThread?.name ?? ''
                  : truncate(getName(receiver));
                const threadImage: string = generalMessageThread?.isGroup
                  ? generalMessageThread?.name ?? ''
                  : receiver?.image ?? '';
                const fullPreviewMessage = `${getName(latestMessage?.user)}: ${previewMessage}`

                return (
                  <HStack
                    key={id}
                    width="full"
                    height="82px"
                    minHeight="82px" 
                    flexShrink={0}                     
                    paddingX={4}
                    paddingY={2}
                    cursor="pointer"
                    borderRadius={8}
                    onClick={() =>
                      messageStore.setCurrentGeneralThreadId(
                        id,
                        latestMessage?.id,
                        currentUser?.id!
                      )
                    }
                    background={isActive ? '#DBF8FF' : 'white'}
                  >
                    <Avatar size="sm" name={threadName} src={threadImage} />
                    <VStack width={'full'} spacing={0}>
                      <HStack width="full" justify="space-between" >
                        <HStack>
                          {!isSeen && (
                            <Box
                              width="8px"
                              height="8px"
                              borderRadius="full"
                              background="#3182CE"
                              marginRight="2px"
                            />
                          )}
                          <Text
                            color={
                              !isSeen
                                ? MESSAGE_UNSEEN_COLOR
                                : isActive
                                ? '#2B6CB0'
                                : 'gray.700'
                            }
                            fontSize="md"
                            fontWeight={!isSeen ? 700 : 600}
                            lineHeight={6}
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {threadName}
                          </Text>
                        </HStack>
                        <Text
                          display="flex"
                          justifyContent="flex-end"
                          fontWeight={!isSeen ? 600 : 400}
                          fontSize="sm"
                          marginRight={fullPreviewMessage?.length >= 74 ? 12 : 0}
                        >
                          {dayjs(latestMessage?.createdAt).fromNow()}
                        </Text>
                      </HStack>
                      <HStack
                        width="full"
                        justify="space-between"
                        color={!isSeen ? MESSAGE_UNSEEN_COLOR : 'gray.700'}
                        fontSize="sm"
                        fontWeight={!isSeen ? 500 : 400}
                        lineHeight={5}
                        spacing={4}
                      >
                        <Text
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          color={!isSeen ? MESSAGE_UNSEEN_COLOR : 'gray.700'}
                          opacity={isActive ? 1 : 0.85}
                          maxW={fullPreviewMessage?.length >= 74 ? '90%' : '100%'}
                        >
                          {fullPreviewMessage}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                );
              }
            )}
          </VStack>
          {!!currentGeneralThreadId && (
            <GeneralDetail isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
        </HStack>
      )}
    </VStack>
  );
};

export default observer(GeneralInbox);
