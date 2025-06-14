import {
	Avatar,
	Box,
	HStack,
	Icon,
	Tag,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react';
import GlobalSpinner from 'components/GlobalSpinner';
import { EBreakPoint } from 'constants/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { IUser } from 'interfaces/user';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from 'routes';
import {
	getPriorityConfig,
	getThreadStatusColor,
	getValidArray,
} from 'utils/common';
import { getName } from 'utils/user';
import InboxDetail from './InboxDetail';
import InboxHeader from './InboxHeader';
import { SupportMessageThreadStatus } from 'interfaces/message';
import { getSupportMessageStatus, MESSAGE_UNSEEN_COLOR } from './constants';
import { FiFlag } from 'react-icons/fi';

const LIMIT = 20;
dayjs.extend(relativeTime);

const InboxPage = () => {
	const { messageStore, organizationStore, userStore } = useStores();
	const { organization } = organizationStore;
	const {
		supportThreads = [],
		currentSupportThreadId,
		totalSupportThreadCount = 0,
	} = messageStore;
	const organizationId = organization?.id ?? '';
	const { currentUser } = userStore;
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const containerRef = useRef<HTMLDivElement>(null);

	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const limit: number = Number(params.get('supportLimit')) || 20;

	const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

	function handleClickMessage(threadId: string): void {
		messageStore.setCurrentSupportThreadId(threadId);
	}

	async function fetchData(): Promise<void> {
		messageStore.changeStatus();
		await messageStore.getSupportMessageThreads(
			organizationId,
			limit,
			!isTablet
		);
		setIsLoading(false);
	}

	useEffect(() => {
		setIsLoading(true);
		userStore.getUsers({ where: { organizationId } });
		messageStore.getTotalSupportMessageThreads(organizationId);
		messageStore.getTotalMessageThreads(organizationId, currentUser?.id ?? '');
		setIsLoading(false);
	}, []);

	useEffect(() => {
		messageStore.getTotalMessageThreads(organizationId, currentUser?.id ?? '');
	}, [currentUser]);

	//INFO: Comment this func to prevent Conflict when render
	useEffect(() => {
		const interval = setInterval(async () => {
			messageStore.getSupportMessages();
			messageStore.getThreadDetail();
			fetchData();
		}, 5000);

		return () => {
			clearInterval(interval);
		};
	}, [limit, isTablet]);

	useEffect(() => {
		const handleScroll = () => {
			if (containerRef.current) {
				const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

				// Check if scrolled to bottom
				const isAtBottom =
					Math.abs(scrollHeight - (clientHeight + scrollTop)) <= 3;

				if (isAtBottom) {
					if (totalSupportThreadCount >= limit) {
						params.set('supportLimit', `${limit + LIMIT}`);
						navigate(`${routes.messages.value}?${params.toString()}`);
					}
				}
			}
		};

		const currentRef = containerRef.current;
		currentRef?.addEventListener('scroll', handleScroll);
		return () => {
			currentRef?.removeEventListener('scroll', handleScroll);
		};
	}, [containerRef.current, limit, totalSupportThreadCount]);

	return (
		<VStack width="full" height="full" spacing={0}>
			{!isLoading && <InboxHeader fetchThreadList={fetchData} />}
			{isLoading && <GlobalSpinner />}
			{supportThreads?.length === 0 && !isLoading ? (
				<VStack width="full" background="white" padding={6}>
					<Text color="gray.700" fontSize="lg" fontWeight={500} lineHeight={6}>
						Your inbox is empty.
					</Text>
					<Text color="gray.700" fontSize="lg" fontWeight={500} lineHeight={6}>
						Messages will appear here once someone leaves a comment.
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
						borderRight="1px solid #E2E8F0"
						ref={containerRef}
					>
						{getValidArray(supportThreads).map((supportThread: any) => {
							const id = supportThread?.thread?.id;
							const processVersion =
								supportThread?.thread?.step?.process?.version ?? '1.0.0';
							const isProcessPublished =
								supportThread?.thread?.step?.process?.isPublished ?? false;
							const status = supportThread?.thread?.status ?? 0;
							const latestMessage = get(
								supportThread?.thread,
								`supportMessage`
							);

							const isSeen = supportThread?.isSeen;
							const stepId = supportThread?.thread?.stepId;
							const latestMessageUser: IUser = get(latestMessage, 'user');

							let previewMessage = latestMessage?.content ?? '';
							if (!previewMessage && !isEmpty(latestMessage?.attachments)) {
								previewMessage = 'sent an attachment(s)';
							}
							const priorityConfig = getPriorityConfig(
								supportThread?.thread?.priority
							);

							// Is this thread currently active/selected
							const isActive = id === currentSupportThreadId;

							return (
								<VStack
									key={id}
									justifyContent={'center'}
									width="full"
									height="82px"
									minHeight="82px"
									flexShrink={0}
									paddingX={4}
									paddingY={2}
									cursor="pointer"
									borderRadius={8}
									onClick={() => handleClickMessage(id)}
									background={isActive ? '#DBF8FF' : 'white'}
								>
									<HStack width="full" justify="space-between">
										<HStack width="full" maxWidth="calc(100% - 98px)">
											<Avatar
												objectFit="scale-down"
												size="xs"
												name={getName(latestMessageUser)}
												src={
													latestMessageUser?.organizationId ??
													'' ??
													latestMessageUser?.image ??
													''
												}
											/>

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
												maxWidth={
													!!processVersion || !isProcessPublished
														? '100%'
														: 'calc(100% - 88px)'
												}
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
												{supportThread?.thread?.subject ??
													supportThread?.thread?.process?.name ??
													supportThread?.thread?.step?.name}
											</Text>
											{stepId && (
												<>
													<Tag
														minWidth="auto"
														color="gray.700"
														background="gray.50"
														border="1px solid #E2E8F0"
													>
														{`v${processVersion}`}
													</Tag>
													{!isProcessPublished && (
														<Tag
															minWidth="auto"
															color="gray.700"
															background="gray.50"
															border="1px solid #E2E8F0"
														>
															Draft
														</Tag>
													)}
												</>
											)}
										</HStack>
                    <HStack maxW={300} w={150}>
                      {priorityConfig && (
                        <Tooltip
                          label={`Priority: ${priorityConfig?.label}`}
                          fontSize="sm"
                          background="gray.700"
                          color="white"
                          borderRadius="4px"
                        >
                          <Box>
                            <Icon
                              as={FiFlag}
                              boxSize={5}
                              fill={priorityConfig?.color}
                              color={priorityConfig?.color}
                            />
                          </Box>
                        </Tooltip>
                      )}
                      <Text
                        width="full"
                        display="flex"
                        justifyContent="flex-end"
                        fontWeight={!isSeen ? 600 : 400}
                        fontSize="sm"
                      >
                        {dayjs(supportThread?.thread?.lastMessageAt).fromNow()}
                      </Text>
                    </HStack>

									</HStack>
									<HStack
										width="full"
										justify="space-between"
										color={!isSeen ? MESSAGE_UNSEEN_COLOR : 'gray.600'}
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
										>
											{`${getName(latestMessage?.user)}: ${previewMessage}`}
										</Text>
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
								</VStack>
							);
						})}
					</VStack>
					{!!currentSupportThreadId && (
						<InboxDetail fetchThreadList={fetchData} />
					)}
				</HStack>
			)}
		</VStack>
	);
};

export default observer(InboxPage);
