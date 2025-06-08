/* eslint-disable max-lines */
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	chakra,
	HStack,
	IconButton,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Spinner,
	Stack,
	Tooltip,
	useDisclosure,
	VStack,
} from '@chakra-ui/react';
import cx from 'classnames';
import ProcessSummary from 'components/Common/ProcessSummary';
import DeleteDialog from 'components/DeleteDialog';
import GlobalSpinner from 'components/GlobalSpinner';
import ModalConfirm from 'components/ModalConfirm';
import ProcessRatingSummary from 'components/ProcessRatingSummary';
import RatingReviewModal from 'components/RatingReviewModal';
import SearchInput from 'components/SearchInput';
import SvgIcon from 'components/SvgIcon';
import { EViewModeLabel } from 'config/constant/enums/process';
import { EShareProcessDetailOption, ProcessViewMode } from 'constants/process';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { IProcessRating } from 'interfaces/rating'; // Create this interface in your interfaces folder
import { IStep, IStepWithRelations } from 'interfaces/step';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import set from 'lodash/set';
import { observer } from 'mobx-react';
import { checkUserCanEditProcess } from 'pages/ProcessPage/utils';
import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Col } from 'reactstrap';
import routes from 'routes';
import colors from 'themes/colors.theme';
import { getValidArray } from 'utils/common';
import CopyProcessModal from './components/CopyProcessModal';
import CreateDraftPreviousVersion from './components/CreateDraftPreviousVersion';
import CreateDuplicateProcessDialog from './components/CreateDuplicateProcessDialog';
import CreateNewDraft from './components/CreateNewDraft';
import EditProcessDetailDrawer from './components/EditProcessDetailDrawer';
import NewStepCard from './components/NewStepCard';
import ProcessDetailDrawer from './components/ProcessDetailDrawer';
import SaveDraftDialog from './components/SaveDraftDialog';
import SendSupportMessageModal from './components/SendSupportMessageModal';
import SetProcessVisibility from './components/SetProcessVisibility';
import ShareProcessToGroupModal from './components/ShareProcessToGroupModal';
import ShareProcessToUserModal from './components/ShareUserModal';
import StepCard from './components/StepCard';
import ModalAddStep from './components/StepCard/components/CardHeader/components/ModalAddStep';
import ViewOtherVersions from './components/ViewOtherVersions';
import styles from './processDetailPage.module.scss';
import { getRenderProcess } from './utils/process';
import {
	archiveProcessById,
	exportProcessDetail,
	getProcessRatings,
} from 'API/process';
import { getName } from 'utils/user';
import { ReactComponent as DownloadIcon } from '../../assets/icons/download.svg';
import { primary500 } from 'themes/globalStyles';

const ProcessDetailPage = () => {
	const params = useParams();
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const selectedStepId: string = query.get('selectedStepId') ?? '';
	const { processStore, authStore, groupStore, commonLibraryStore, stepStore } =
		useStores();
	const { groupMembers } = groupStore;
	const { expandingSteps, process } = processStore;
	const isManageMode = processStore?.isManageModeInDetail;
	const userId = authStore?.userDetail?.id ?? '';
	const isBasicUser =
		authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
	const [loading, setLoading] = useState(false);
	const [isLoadingContent, setIsLoadingContent] = useState(false);
	const [isStartEditing, setIsStartEditing] = useState<boolean>(false);
	const [showViewOtherVersions, setShowViewOtherVersions] =
		useState<boolean>(false);
	const [
		showCreateDuplicateProcessDialog,
		setShowCreateDuplicateProcessDialog,
	] = useState<boolean>(false);
	const [showCreateDraftPreviousVersion, setShowCreateDraftPreviousVersion] =
		useState<boolean>(false);
	const [showCreateNewDraft, setShowCreateNewDraft] = useState<boolean>(false);
	const [showSaveDraft, setShowSaveDraft] = useState<boolean>(false);
	const [showEditCollaborators, setShowEditCollaborators] =
		useState<boolean>(false);
	const [showSetProcessVisibility, setShowSetProcessVisibility] =
		useState<boolean>(false);
	const [deleteProcessId, setDeleteProcessId] = useState<string>('');
	const [selectedStep, setSelectedStep] = useState<IStep | undefined>(
		stepStore.selectedStep
	);
	const [disabledButtonPublishDraft, setDisabledButtonPublishDraft] = useState<
		string[]
	>([]);
	const [isOpenNewMessageModal, setIsOpenNewMessageModal] =
		useState<boolean>(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
	const [isOpenRestoreModal, setIsOpenRestoreModal] = useState(false);
	const {
		isOpen: isOpenQuickViewModal,
		onOpen: openQuickViewModal,
		onClose: closeQuickViewModal,
	} = useDisclosure();
	const {
		isOpen: isOpenEditProcessModal,
		onOpen: openEditProcessModal,
		onClose: closeEditProcessModal,
	} = useDisclosure();
	const {
		isOpen: isOpenCopyProcessModal,
		onOpen: openCopyProcessModal,
		onClose: closeCopyProcessModal,
	} = useDisclosure();
	const {
		isOpen: isOpenSendSupportMessageModal,
		onOpen: openSendSupportMessageModal,
		onClose: closeSendSupportMessageModal,
	} = useDisclosure();
	const {
		isOpen: isOpenAddStepModal,
		onOpen: openAddStepModal,
		onClose: closeAddStepModal,
	} = useDisclosure();
	const {
		isOpen: isOpenLeaveCommentModal,
		onOpen: openLeaveCommentModal,
		onClose: closeLeaveCommentModal,
	} = useDisclosure({ defaultIsOpen: !!selectedStep });
	const [userHasEditPermission, setUserHasEditPermission] = useState(
		isBasicUser && checkUserCanEditProcess(userId, groupMembers, process)
	);
	const {
		isOpen: isOpenStepDetail,
		onOpen: onOpenStepDetail,
		onClose: onCloseStepDetail,
	} = useDisclosure();
	const {
		isOpen: isOpenShareGroupModal,
		onOpen: onOpenShareGroupModal,
		onClose: onCloseShareGroupModal,
	} = useDisclosure();
	const {
		isOpen: isOpenShareUserModal,
		onOpen: onOpenShareUserModal,
		onClose: onCloseShareUserModal,
	} = useDisclosure();
	const {
		isOpen: isOpenDetailDrawer,
		onOpen: onOpenDetailDrawer,
		onClose: onCloseDetailDrawer,
	} = useDisclosure();
	const {
		isOpen: isOpenEditDrawer,
		onOpen: onOpenEditDrawer,
		onClose: onCloseEditDrawer,
	} = useDisclosure();

	const isProcessArchived = process?.archivedAt && process?.archivedAt !== null;
	const isPublished = !!process?.isPublished;
	const viewMode =
		expandingSteps.length > 0
			? ProcessViewMode.EXPANDED_VIEW
			: ProcessViewMode.LIST_VIEW;
	const processId = String(get(params, 'processId', ''));
	const steps: IStepWithRelations[] = Array.isArray(process?.steps)
		? process?.steps.filter((step) => !step.archived)
		: [];
	const [searchText, setSearchText] = useState('');
	const [searchResults, setSearchResults] =
		useState<IStepWithRelations[]>(steps);
	const isExpandedView = viewMode === ProcessViewMode.EXPANDED_VIEW;
	const navigate = useNavigate();
	const collaborators = process?.collaborators ?? [];
	const collaboratorIds = collaborators.map((collaborator) => collaborator.id);
	const canEditProcess: boolean =
		(isBasicUser &&
			[process?.createdBy ?? '', ...collaboratorIds].includes(userId)) ||
		!isBasicUser ||
		userHasEditPermission;
	const isStepDragDisabled = isExpandedView || !canEditProcess || !isManageMode;
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

	const stepsBecomeCommonSteps = steps.filter((step) => step?.commonLibrary);
	const showAddAllStepToCommon =
		steps?.length &&
		steps.length > stepsBecomeCommonSteps.length &&
		!isBasicUser;
	const [listCommonDeletedSteps, setListCommonDeletedSteps] = useState<
		IStepWithRelations[]
	>(
		getValidArray(searchResults).filter(
			(step) => step?.isDeleted && !step.isSeenDeleted
		) ?? []
	);

	const [isOpenRatingModal, setIsOpenRatingModal] = useState<boolean>(false);
	const [isRatingSummaryCollapsed, setIsRatingSummaryCollapsed] =
		useState<boolean>(false);
	const [processRatings, setProcessRatings] = useState<IProcessRating[]>([]);

	// Add this function to the ProcessDetailPage component to fetch ratings
	async function fetchProcessRatings(): Promise<void> {
		try {
			// In a real implementation, you would make an API call here
			const ratings = await getProcessRatings(processId);
			setProcessRatings(ratings);
		} catch (error) {
			console.error('Error fetching process ratings:', error);
		}
	}

	async function getPermissionForUserOnProcess() {
		setUserHasEditPermission(
			isBasicUser && checkUserCanEditProcess(userId, groupMembers, process)
		);
	}

	useEffect(() => {
		if (isBasicUser) {
			getPermissionForUserOnProcess();
		}
	}, [isBasicUser, process]);

	useEffect(() => {
		if (isProcessArchived) {
			processStore.setCanUserEditInProcessDetail(false);
		} else {
			processStore.setCanUserEditInProcessDetail(canEditProcess);
		}
	}, [canEditProcess, isProcessArchived, isManageMode, userHasEditPermission]);

	useEffect(() => {
		if (processId) {
			fetchProcessRatings();
		}
	}, [processId]);

	function fetchData() {
		setLoading(true);
		processStore.setSelectedProcessId(processId);
		getRenderProcess(processId, processStore)
			.catch((error) => {
				console.log('🚀 ~ fetchData ~ error:', error);
				toast.error(
					'You are not allowed to access this process, redirecting back.'
				);
				navigate(routes.dashboard.value, { replace: true });
			})
			.finally(() => {
				setLoading(false);
			});
	}

	useEffect(() => {
		if (processId) {
			fetchData();
		}
	}, [processId]);

	useEffect(() => {
		// *INFO: Incase not get list groupMember before access Process Detail Page
		if (groupMembers?.length === 0) {
			groupStore.fetchGroupMemberOfCurrentUser();
		}
	}, [groupMembers?.length]);

	useEffect(() => {
		if (!!selectedStepId) {
			processStore.setExpandingSteps([selectedStepId]);
		}
	}, [query.toString()]);

	const reorder = (
		list: IStepWithRelations[],
		startIndex: number,
		endIndex: number
	): IStepWithRelations[] => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	async function onDeleteProcess() {
		try {
			// await deleteProcessById(processId);
			navigate(routes.archive.value);
			toast.success('Process deleted successfully');
		} catch (error: any) {
			toast.error('Process deleted failed');
		} finally {
			setIsOpenDeleteModal(false);
		}
	}

	async function onRestoreProcess() {
		try {
			// await restoreProcessToDraftById(processId);
			toast.success('Process restored successfully');
			navigate(routes.archive.value);
		} catch (error: any) {
			toast.error('Process restored failed');
		} finally {
			setIsOpenRestoreModal(false);
		}
	}

	function handleOpenStepCommentModal(step: IStep): void {
		setSelectedStep(step);
		openLeaveCommentModal();
	}

	function handleDisablePublishDraft(id: string): void {
		let newArray: string[] = disabledButtonPublishDraft;
		if (newArray.indexOf(id) !== -1) {
			newArray.splice(newArray.indexOf(id), 1);
			setDisabledButtonPublishDraft(newArray);
		} else {
			setDisabledButtonPublishDraft([...disabledButtonPublishDraft, id]);
		}
	}

	async function handlePublishDraft(): Promise<void> {
		try {
			getRenderProcess(processId, processStore);
			toast.success('Publish draft successfully');
		} catch (error: any) {
			toast.error('Publish draft failed');
		}
	}

	async function handleArchiveProcess() {
		try {
			await archiveProcessById(deleteProcessId);
			navigate(routes.processes.value);
			toast.success('Process archived successfully');
		} catch (error: any) {
			toast.error('Archive process failed');
		} finally {
			setDeleteProcessId('');
		}
	}
	const handleChange = useCallback(
		debounce((event: { target: { value: string } }) => {
			setSearchText(event?.target?.value ?? '');
		}, 500),
		[]
	);

	async function fetchCommonLibrarySteps() {
		try {
			commonLibraryStore.fetchCommonLibraryComponents('');
		} catch (error: any) {
			console.log(error);
		}
	}

	async function handleExportProcessDetail() {
		try {
			setIsLoadingContent(true);
			const response = await exportProcessDetail(processId);
			const blob = response.data;
			const url = URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = `${processId}.pdf`;
			document.body.appendChild(link);
			link.click();

			setTimeout(() => {
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}, 100);

			toast.success('Process detail exported successfully');
		} catch (error) {
			console.error(error);
			toast.error('Export process detail failed');
		} finally {
			setIsLoadingContent(false);
		}
	}

	useEffect(() => {
		const results: IStepWithRelations[] = getValidArray(process?.steps).filter(
			(step) => {
				const isValid: boolean =
					step?.blocks?.some((block) =>
						(searchText ?? '')
							.toLowerCase()
							.split(' ')
							.some((word) => block.content.toLowerCase().includes(word))
					) ?? false;
				return (
					(step?.name ?? '')
						.toLowerCase()
						.includes((searchText ?? '').toLowerCase()) || isValid
				);
			}
		);

		setSearchResults(results);
	}, [searchText, process]);

	useEffect(() => {
		fetchCommonLibrarySteps();
	}, []);

	if (loading) return <GlobalSpinner />;
	return (
		<>
			<chakra.div className={styles.actionWrapper} paddingTop={'24px'}>
				<VStack>
					<HStack
						justifyContent="space-between"
						w="100%"
						flexWrap="wrap"
						gap={2}
						spacing={0}
					>
						<HStack width={{ base: 'full', md: 'initial' }}>
							<HStack
								width={{ base: 'full', md: '320px' }}
								borderRadius="6px"
								bg="white"
								border=" 1px solid #E2E8F0"
							>
								<SearchInput
									placeholder="Search step in this process"
									onChange={handleChange}
								/>
							</HStack>
							{!isMobile && (
								<HStack
									alignItems="center"
									cursor="pointer"
									fontSize="24px"
									marginLeft="16px"
									borderRadius="6px"
									border="1px solid #E2E8F0"
									background="white"
								>
									<Stack
										padding="10px"
										background={!isExpandedView ? 'gray.600' : 'white'}
										borderRadius="6px 0px 0px 6px"
										margin="0px"
										flex={1}
										onClick={() => processStore.setExpandingSteps([])}
									>
										<Tooltip
											label={EViewModeLabel.LIST_VIEW}
											placement="top"
											hasArrow
											shouldWrapChildren
										>
											<SvgIcon
												className={cx(styles.icon, {
													[styles.active]: !isExpandedView,
												})}
												iconName="baseline-format-list-numbered"
											/>
										</Tooltip>
									</Stack>
									<Stack
										padding="10px"
										margin="0px !important"
										background={isExpandedView ? 'gray.600' : 'white'}
										borderRadius="0px 6px 6px 0px"
										flex={1}
										onClick={() => {
											const newExpandedStepIds: string[] = getValidArray(
												process.steps
											).map((step: IStep) => step?.id ?? '');
											processStore.setExpandingSteps(newExpandedStepIds);
										}}
									>
										<Tooltip
											label={EViewModeLabel.EXPANDED_VIEW}
											placement="top"
											hasArrow
											shouldWrapChildren
										>
											<SvgIcon
												className={cx(styles.icon, {
													[styles.active]: isExpandedView,
												})}
												iconName="expanded-view"
											/>
										</Tooltip>
									</Stack>
								</HStack>
							)}
						</HStack>
						{isProcessArchived ? (
							<HStack>
								<Stack>
									<Button
										leftIcon={<SvgIcon size={16} iconName="restore" />}
										variant="outline"
										background="white"
										border="1px solid #E2E8F0"
										borderRadius="8px"
										color="gray.700"
										fontWeight={500}
										fontSize="16px"
										lineHeight="24px"
										_hover={{ background: 'whiteAlpha.700' }}
										_active={{ background: 'whiteAlpha.700' }}
										onClick={() => setIsOpenRestoreModal(true)}
									>
										Restore
									</Button>
								</Stack>
								<Stack>
									<Button
										leftIcon={<SvgIcon size={16} iconName="ic_delete" />}
										variant="outline"
										background="white"
										border="1px solid #E2E8F0"
										borderRadius="8px"
										color="gray.700"
										fontWeight={500}
										fontSize="16px"
										lineHeight="24px"
										_hover={{ background: 'whiteAlpha.700' }}
										_active={{ background: 'whiteAlpha.700' }}
										onClick={() => setIsOpenDeleteModal(true)}
									>
										Permanently Delete
									</Button>
								</Stack>
							</HStack>
						) : (
							<HStack width={{ base: 'full', md: 'initial' }} spacing={1}>
								{isMobile && (
									<Box width="full">
										<HStack
											width="80px"
											alignItems="center"
											cursor="pointer"
											fontSize="24px"
											borderRadius="6px"
											border="1px solid #E2E8F0"
											background="white"
										>
											<Stack
												padding={isMobile ? '2px' : '10px'}
												background={!isExpandedView ? 'gray.600' : 'white'}
												borderRadius="6px 0px 0px 6px"
												margin="0px"
												flex={1}
												onClick={() => processStore.setExpandingSteps([])}
												alignItems={'center'}
												justifyContent={'center'}
											>
												<Tooltip
													label={EViewModeLabel.LIST_VIEW}
													placement="top"
													hasArrow
													shouldWrapChildren
												>
													<SvgIcon
														className={cx(styles.icon, {
															[styles.active]: !isExpandedView,
														})}
														iconName="baseline-format-list-numbered"
														size={16}
													/>
												</Tooltip>
											</Stack>
											<Stack
												padding={isMobile ? '2px' : '10px'}
												margin="0px !important"
												background={isExpandedView ? 'gray.600' : 'white'}
												borderRadius="0px 6px 6px 0px"
												flex={1}
												alignItems={'center'}
												justifyContent={'center'}
												onClick={() => {
													const newExpandedStepIds: string[] = getValidArray(
														process.steps
													).map((step: IStep) => step?.id ?? '');
													processStore.setExpandingSteps(newExpandedStepIds);
												}}
											>
												<Tooltip
													label={EViewModeLabel.EXPANDED_VIEW}
													placement="top"
													hasArrow
													shouldWrapChildren
												>
													<SvgIcon
														className={cx(styles.icon, {
															[styles.active]: isExpandedView,
														})}
														iconName="expanded-view"
														size={16}
													/>
												</Tooltip>
											</Stack>
										</HStack>
									</Box>
								)}
								{!isProcessArchived &&
									isPublished &&
									isManageMode &&
									canEditProcess && (
										<Stack>
											<Menu>
												<MenuButton
													as={Button}
													gap={{ base: 0, md: 2 }}
													width={{ base: 10, md: 'initial' }}
													paddingX={{ base: 0, md: 4 }}
													background="white"
													border="1px solid #E2E8F0"
													borderRadius="8px"
													color="gray.700"
													fontWeight={500}
													fontSize={{
														base: '0px',
														md: '16px',
													}}
													lineHeight="24px"
													_hover={{ background: 'whiteAlpha.700' }}
													_active={{ background: 'whiteAlpha.700' }}
                          display={"flex"}
													justifyContent={'center'}
													alignItems={'center'}
												>
													<SvgIcon size={16} iconName="share-button" style={{ marginRight: !isMobile ? '6px' : '0' }} />
													Share process
													{!isMobile && <ChevronDownIcon marginLeft={3}/>}
												</MenuButton>
												<MenuList>
													<MenuItem
														background="white"
														border="none"
														color="gray.700"
														fontWeight={500}
														fontSize={{
															base: '16px',
															md: '16px',
														}}
														lineHeight="24px"
														_hover={{ background: 'gray.100' }}
														onClick={onOpenShareGroupModal}
													>
														Share with {EShareProcessDetailOption.GROUP}
													</MenuItem>
													{!isBasicUser && (
														<MenuItem
															background="white"
															border="none"
															color="gray.700"
															fontWeight={500}
															fontSize={{
																base: '16px',
																md: '16px',
															}}
															lineHeight="24px"
															_hover={{ background: 'gray.100' }}
															onClick={onOpenShareUserModal}
														>
															Share with {EShareProcessDetailOption.USER}
														</MenuItem>
													)}
												</MenuList>
											</Menu>
										</Stack>
									)}
								<Stack>
									<Button
										gap={{ base: 0, md: 2 }}
										width={{ base: 10, md: 'initial' }}
										paddingX={{ base: 0, md: 4 }}
										variant="outline"
										background="white"
										border="1px solid #E2E8F0"
										borderRadius="8px"
										color="gray.700"
										fontWeight={500}
										fontSize={{
											base: '0px',
											md: '16px',
										}}
										lineHeight="24px"
										_hover={{ background: 'whiteAlpha.700' }}
										_active={{ background: 'whiteAlpha.700' }}
										onClick={() => handleExportProcessDetail()}
									>
										{isLoadingContent ? (
											<Spinner color={primary500} />
										) : (
											<>
												<DownloadIcon width={16} />
												Export Process
											</>
										)}
									</Button>
								</Stack>
								<Stack>
									<Button
										gap={{ base: 0, md: 2 }}
										width={{ base: 10, md: 'initial' }}
										paddingX={{ base: 0, md: 4 }}
										variant="outline"
										background="white"
										border="1px solid #E2E8F0"
										borderRadius="8px"
										color="gray.700"
										fontWeight={500}
										fontSize={{
											base: '0px',
											md: '16px',
										}}
										lineHeight="24px"
										_hover={{ background: 'whiteAlpha.700' }}
										_active={{ background: 'whiteAlpha.700' }}
										onClick={() => setIsOpenRatingModal(true)}
									>
										<SvgIcon size={16} iconName="star-outline" />
										Rate Process
									</Button>
								</Stack>
								<Stack>
									<Button
										gap={{ base: 0, md: 2 }}
										width={{ base: 10, md: 'initial' }}
										paddingX={{ base: 0, md: 4 }}
										variant="outline"
										background="white"
										border="1px solid #E2E8F0"
										borderRadius="8px"
										color="gray.700"
										fontWeight={500}
										fontSize={{
											base: '0px',
											md: '16px',
										}}
										lineHeight="24px"
										_hover={{ background: 'whiteAlpha.700' }}
										_active={{ background: 'whiteAlpha.700' }}
										onClick={onOpenDetailDrawer}
									>
										<SvgIcon size={16} iconName="ic-outline-view-headline" />
										Process detail
									</Button>
								</Stack>
								<Stack>
									<Button
										gap={{ base: 0, md: 2 }}
										width={{ base: 10, md: 'initial' }}
										paddingX={{ base: 0, md: 4 }}
										variant="outline"
										background="white"
										border="1px solid #E2E8F0"
										borderRadius="8px"
										color="gray.700"
										fontWeight={500}
										fontSize={{
											base: '0px',
											md: '16px',
										}}
										lineHeight="24px"
										_hover={{ background: 'whiteAlpha.700' }}
										_active={{ background: 'whiteAlpha.700' }}
										onClick={openSendSupportMessageModal}
										// onClick={() => setIsOpenNewMessageModal(true)}
									>
										<SvgIcon size={16} iconName="outline-message" />
										Comment
									</Button>
								</Stack>
								{isManageMode && (
									<Stack>
										<Menu>
											{!isBasicUser && commonLibraryStore?.isFeatureEnabled ? (
												<Tooltip
													label={
														'Seem you want to add several steps to common library. Try to add all steps by clicking here.'
													}
													fontSize="14px"
													lineHeight="20px"
													fontWeight="400"
													padding={2}
													marginBottom={2}
													placement="bottom-end"
													background="#5C5C5C"
													color="white"
													hasArrow
													borderRadius="4px"
													shouldWrapChildren={false}
												>
													<MenuButton
														as={IconButton}
														icon={
															<SvgIcon
																size={40}
																iconName="more-button"
																color={colors.gray[700]}
															/>
														}
														aria-label="More button"
														variant="outline"
														background="white"
														border="1px solid #E2E8F0"
														borderRadius="6px"
														_hover={{ background: 'whiteAlpha.700' }}
														_active={{ background: 'whiteAlpha.700' }}
													/>
												</Tooltip>
											) : (
												<MenuButton
													as={IconButton}
													icon={
														<SvgIcon
															size={40}
															iconName="more-button"
															color={colors.gray[700]}
														/>
													}
													aria-label="More button"
													variant="outline"
													background="white"
													border="1px solid #E2E8F0"
													borderRadius="6px"
													_hover={{ background: 'whiteAlpha.700' }}
													_active={{ background: 'whiteAlpha.700' }}
												/>
											)}
											<MenuList>
												{!isPublished && (
													<MenuItem
														background="white"
														border="none"
														color="gray.700"
														icon={
															<SvgIcon
																size={15}
																iconName="ic_sharp-public"
																color={colors.gray[700]}
															/>
														}
														onClick={handlePublishDraft}
													>
														Publish draft
													</MenuItem>
												)}
												{!isBasicUser && (
													<MenuItem
														background="white"
														border="none"
														color="gray.700"
														icon={
															<SvgIcon
																size={15}
																iconName="copy"
																color={colors.gray[700]}
															/>
														}
														_hover={{ background: 'gray.100' }}
														onClick={openCopyProcessModal}
													>
														Make a copy
													</MenuItem>
												)}
												<MenuItem
													background="white"
													border="none"
													color="gray.700"
													icon={
														<SvgIcon
															size={15}
															iconName="archive"
															color={colors.gray[700]}
														/>
													}
													_hover={{ background: 'gray.100' }}
													onClick={() => setDeleteProcessId(processId)}
												>
													Archive process
												</MenuItem>
											</MenuList>
										</Menu>
									</Stack>
								)}
							</HStack>
						)}
					</HStack>
					{!isProcessArchived && isManageMode && canEditProcess && (
						<HStack
							justifyContent="center"
							w="100%"
							marginTop="24px !important"
						>
							<Button
								fontWeight={500}
								fontSize="16px"
								lineHeight="24px"
								color="gray.700"
								width="100%"
								border="1px dashed #718096"
								borderRadius="6px"
								onClick={openAddStepModal}
							>
								+ Add new step
							</Button>
						</HStack>
					)}
				</VStack>
			</chakra.div>
			<ViewOtherVersions
				isOpen={showViewOtherVersions}
				toggle={() => setShowViewOtherVersions(!showViewOtherVersions)}
			/>
			<CreateDuplicateProcessDialog
				isOpen={showCreateDuplicateProcessDialog}
				toggle={() =>
					setShowCreateDuplicateProcessDialog(!showCreateDuplicateProcessDialog)
				}
			/>
			<CreateDraftPreviousVersion
				isOpen={showCreateDraftPreviousVersion}
				toggle={() =>
					setShowCreateDraftPreviousVersion(!showCreateDraftPreviousVersion)
				}
			/>
			<CreateNewDraft
				isOpen={showCreateNewDraft}
				toggle={() => setShowCreateNewDraft(!showCreateNewDraft)}
			/>
			<SaveDraftDialog
				isOpen={showSaveDraft}
				toggle={() => setShowSaveDraft(!showSaveDraft)}
			/>
			<DeleteDialog
				title="Archive Processes"
				isOpen={!!deleteProcessId}
				message="Are you sure you want to ARCHIVED this process? You can find archived items in the Archive page."
				toggle={() => setDeleteProcessId('')}
				onDelete={handleArchiveProcess}
				onCancel={() => setDeleteProcessId('')}
				confirmText="Archive"
			/>
			<SetProcessVisibility
				isOpen={showSetProcessVisibility}
				toggle={() => setShowSetProcessVisibility(!showSetProcessVisibility)}
			/>
			<CopyProcessModal
				isOpen={isOpenCopyProcessModal}
				onClose={closeCopyProcessModal}
				processId={process?.id ?? ''}
			/>
			<SendSupportMessageModal
				isOpen={isOpenSendSupportMessageModal}
				onClose={closeSendSupportMessageModal}
				process={process}
			/>
			{/* <NewSupportMessageModal
        isOpen={isOpenNewMessageModal}
        toggle={() => setIsOpenNewMessageModal((prevOpen) => !prevOpen)}
        process={process}
        loadOptionsFromProcessDetail={true}
      /> */}
			{/* {selectedStep && (
        <LeaveCommentModal
          isOpen={isOpenLeaveCommentModal}
          onClose={handleCloseStepCommentModal}
          process={process}
          selectedStep={selectedStep}
        />
      )} */}
			<DragDropContext
				onDragEnd={(result) => {
					if (result.destination) {
						const items = reorder(
							steps,
							result.source.index,
							result.destination.index
						);
						setSearchResults(items);

						processStore.setProcessStepPosition(
							items,
							result.source.index,
							result.destination.index
						);
					}
				}}
			>
				<Droppable
					droppableId="droppable"
					isDropDisabled={Boolean(isExpandedView || isProcessArchived)}
				>
					{(provided, _) => (
						<div {...provided.droppableProps} ref={provided.innerRef}>
							{steps.length > 0 ? (
								getValidArray(searchResults)
									.filter((step) => !step?.archived && !step?.isDeleted)
									.map((step: IStepWithRelations, index: number) => {
										const displayStep = step;
										set(displayStep, 'position', index + 1);
										return (
											<Draggable
												key={step.id}
												draggableId={`${step.id}`}
												index={index}
												isDragDisabled={isStepDragDisabled}
											>
												{(provided, { isDragging }) => (
													<div
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														ref={provided.innerRef}
														className={cx(styles.draggableContainer, {
															[styles.isDragging]: isDragging,
															[styles.isDragDisabled]: isStepDragDisabled,
														})}
													>
														<Box key={index} width="100%">
															<SvgIcon
																className={styles.dragIcon}
																iconName="drag-indicator"
															/>
															<StepCard
																canEditProcess={canEditProcess}
																isStartEditing={isStartEditing}
																isDragging={isDragging}
																procedureId={processId}
																step={displayStep}
																isCommonStepFromStepId={
																	step?.originalStepId ? step?.id : ''
																}
																lastStep={steps?.length <= 1}
																onToggleMessageView={() =>
																	handleOpenStepCommentModal(step)
																}
																handleShowAutosave={() => {}}
																setDisabledButtonPublishDraft={(id: string) =>
																	handleDisablePublishDraft(id)
																}
																searchText={searchText}
															/>
														</Box>
													</div>
												)}
											</Draggable>
										);
									})
							) : (
								<Col xl="12" lg="12" md="12" sm="12" xs="12">
									<NewStepCard
										procedureId={processId}
										newPosition={1}
										setIsStartEditing={() => setIsStartEditing(true)}
									/>
								</Col>
							)}
						</div>
					)}
				</Droppable>
			</DragDropContext>

			<ProcessSummary
				isOpen={isOpenQuickViewModal}
				onClose={closeQuickViewModal}
				onEditProcess={() => {
					closeQuickViewModal();
					openEditProcessModal();
				}}
			/>
			{/* {!!commonStepIdsNeedToUpdate?.length && (
        <UpdatedDerivedStepsModal
          refetch={fetchData}
          openReview={onOpenStepDetail}
        />
      )} */}
			{isOpenDeleteModal && (
				<ModalConfirm
					title="Permanently delete?"
					content="Are you sure you want to delete this Process? This action can not be undo."
					isOpen={isOpenDeleteModal}
					confirmAction="Delete"
					toggle={() => setIsOpenDeleteModal(!isOpenDeleteModal)}
					isDelete
					onAccept={() => onDeleteProcess()}
				/>
			)}
			{isOpenRestoreModal && (
				<ModalConfirm
					title="Restore Process?"
					content="Are you sure you want to restore this Process?"
					isOpen={isOpenRestoreModal}
					confirmAction="Restore"
					toggle={() => setIsOpenRestoreModal(!isOpenRestoreModal)}
					onAccept={() => onRestoreProcess()}
				/>
			)}

			{isOpenShareGroupModal && (
				<ShareProcessToGroupModal
					isOpen={isOpenShareGroupModal}
					onClose={onCloseShareGroupModal}
					afterShare={async () => getRenderProcess(processId, processStore)}
				/>
			)}

			{isOpenShareUserModal && (
				<ShareProcessToUserModal
					isOpen={isOpenShareUserModal}
					onClose={onCloseShareUserModal}
					afterShare={async () => getRenderProcess(processId, processStore)}
				/>
			)}

			{isOpenDetailDrawer && (
				<ProcessDetailDrawer
					canSetting={canEditProcess}
					isOpen={isOpenDetailDrawer}
					onOpenEditDrawer={() => {
						onOpenEditDrawer();
						onCloseDetailDrawer();
					}}
					onClose={onCloseDetailDrawer}
				/>
			)}

			{isOpenEditDrawer && (
				<EditProcessDetailDrawer
					isOpen={isOpenEditDrawer}
					onClose={onCloseEditDrawer}
				/>
			)}

			<ModalAddStep
				isOpen={isOpenAddStepModal}
				onClose={closeAddStepModal}
				procedureId={processId}
				handleShowAutosave={() => {}}
			/>

			{isOpenRatingModal && (
				<RatingReviewModal
					isOpen={isOpenRatingModal}
					onClose={() => setIsOpenRatingModal(false)}
					process={process}
					userId={authStore?.userDetail?.id ?? ''}
					userName={authStore?.userDetail?.username ?? ''}
					fetchProcessRatings={fetchProcessRatings}
				/>
			)}
			{/* Add ProcessRatingSummary here */}
			{processRatings?.length > 0 && (
				<Box mt={4} mb={4} mx="auto" maxW="100%">
					<ProcessRatingSummary
						process={process}
						ratings={processRatings.map((rating) => ({
							id: rating.id,
							userName: getName(rating.user),
							avatar: rating.user?.image ?? '',
							rating: rating.rating,
							review: rating.review,
							createdAt: new Date(rating.createdAt)?.toISOString(),
						}))}
						canRate={true}
						onRateProcess={() => setIsOpenRatingModal(true)}
						isCollapsed={isRatingSummaryCollapsed}
						onToggleCollapse={() =>
							setIsRatingSummaryCollapsed(!isRatingSummaryCollapsed)
						}
					/>
				</Box>
			)}
		</>
	);
};

export default observer(ProcessDetailPage);
