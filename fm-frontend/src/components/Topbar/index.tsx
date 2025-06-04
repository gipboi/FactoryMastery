import { ChevronRightIcon } from '@chakra-ui/icons';
import { Divider, Flex, HStack, Stack, Text, Box } from '@chakra-ui/react';
import { toggleFavorite } from 'API/favorite';
import { ReactComponent as CollapseIcon } from 'assets/icons/collapse.svg';
import { ReactComponent as ExpandIcon } from 'assets/icons/expand.svg';
import { ReactComponent as FavoriteIcon } from 'assets/icons/favorite.svg';
import { ReactComponent as UnFavoriteIcon } from 'assets/icons/un_favorite.svg';
import cx from 'classnames';
import HeaderBar from 'components/HeaderBar';
import SvgIcon from 'components/SvgIcon';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import routes from 'routes';
import { getName } from 'utils/user';
import NotificationBell from './components/NotificationBell';
import ProfileDropdown from './components/ProfileDropdown';
import { profileMenus } from './constants';
import styles from './topSidebar.module.scss';
import useBreakPoint from 'hooks/useBreakPoint';
import { EBreakPoint } from 'constants/theme';

interface ITopBarProps {
	showSidebarMobile: boolean;
	setShowSidebarMobile: () => void;
}

// Responsive breadcrumb component
const ResponsiveBreadcrumb = ({ 
	children, 
	isMobile, 
	showVersionTag = false, 
	versionTag, 
	showArchiveTag = false, 
	archiveTag,
	showFavorite = false,
	favoriteElement 
}: {
	children: React.ReactNode;
	isMobile: boolean;
	showVersionTag?: boolean;
	versionTag?: React.ReactNode;
	showArchiveTag?: boolean;
	archiveTag?: React.ReactNode;
	showFavorite?: boolean;
	favoriteElement?: React.ReactNode;
}) => {
	if (isMobile) {
		return (
			<Flex direction="column" width="100%" gap={1}>
				<Flex overflow="hidden" width="100%" alignItems="center">
					{children}
				</Flex>
				{(showVersionTag || showArchiveTag || showFavorite) && (
					<Flex gap={2} alignItems="center" flexWrap="wrap">
						{showVersionTag && versionTag}
						{showArchiveTag && archiveTag}
						{showFavorite && favoriteElement}
					</Flex>
				)}
			</Flex>
		);
	}

	return (
		<Flex width="100%" alignItems="center" gap={1}>
			<Box flex="1" overflow="hidden">
				{children}
			</Box>
			{(showVersionTag || showArchiveTag || showFavorite) && (
				<Flex gap={2} alignItems="center" flexShrink={0}>
					{showVersionTag && versionTag}
					{showArchiveTag && archiveTag}
					{showFavorite && favoriteElement}
				</Flex>
			)}
		</Flex>
	);
};

const TopBar = (props: ITopBarProps) => {
	const { showSidebarMobile, setShowSidebarMobile } = props;
	const {
		userStore,
		groupStore,
		processStore,
		favoriteStore,
		reportStore,
		collectionStore,
	} = useStores();
	const { process } = processStore;
	const { collection } = collectionStore;
	const navigate = useNavigate();
	const location = useLocation();
	const isProcessArchived = process?.archivedAt && process?.archivedAt !== null;
	const [isProcessFavorite, setIsProcessFavorite] =
		React.useState<boolean>(false);
	const [isCollectionFavorite, setIsCollectionFavorite] =
		React.useState<boolean>(false);
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

	function toggleFavoriteProcess(): void {
		setIsProcessFavorite(!isProcessFavorite);
		toggleFavorite({ processId: process?.id });
	}

	function toggleFavoriteCollection(): void {
		setIsCollectionFavorite(!isCollectionFavorite);
		toggleFavorite({ collectionId: collection?.id });
	}

	useEffect(() => {
		process?.id &&
			favoriteStore.getIsFavorite({ processId: process?.id }).then((res) => {
				setIsProcessFavorite(res);
			});
		collection?.id &&
			favoriteStore
				.getIsFavorite({ collectionId: collection?.id })
				.then((res) => {
					setIsCollectionFavorite(res);
				});
	}, [process, collection]);

	return (
		<React.Fragment>
			<div
				className={cx(styles.topBarWrapper, {
					[styles.topBarWrapperMobile]: !showSidebarMobile,
          [styles.mobile]: isMobile,
				})}
			>
				<Stack display="flex" spacing={0}>
					<Flex
						className={styles.commonHeader}
						justifyContent="space-between"
						alignItems="center"
						paddingX={isMobile ? 4 : 8}
						minHeight="60px"
					>
						<HStack spacing={isMobile ? 4 : 6}>
							{showSidebarMobile ? (
								<CollapseIcon
									width={32}
									height={32}
									cursor="pointer"
									onClick={setShowSidebarMobile}
								/>
							) : (
								<ExpandIcon
									width={32}
									height={32}
									cursor="pointer"
									fill="black"
									onClick={setShowSidebarMobile}
								/>
							)}
						</HStack>
						<HStack spacing={isMobile ? 3 : 6}>
							<NotificationBell />
							<ProfileDropdown menuItems={profileMenus} />
						</HStack>
					</Flex>
					<Divider margin={0} />

					<Flex
						justifyContent="space-between"
						alignItems="center"
						paddingX={isMobile ? 4 : 8}
						paddingY={isMobile ? 2 : 4}
						className={styles.pageHeader}
						minHeight={isMobile ? "auto" : "60px"}
					>
						{/* -----------PROCESS-------------- */}
						{!!matchPath(location?.pathname, routes.processes.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.processes.value, { replace: true })
											}
										>
											Processes
										</Text>
									</HStack>
								}
								controlBy="processList"
							/>
						)}

						{/* -----------PROCESS DETAIL-------------- */}
						{!!matchPath(
							`${routes.processes.value}/:processId`,
							location?.pathname
						) && (
							<HeaderBar
								title={
									<ResponsiveBreadcrumb
										isMobile={isMobile}
										showVersionTag={true}
										versionTag={
											<span className={styles.tagContainer}>{`v${
												process?.version ?? '1.0.0'
											}`}</span>
										}
										showArchiveTag={isProcessArchived}
										archiveTag={
											<span
												className={cx(styles.tagContainer, styles.archive)}
											>
												Archived
											</span>
										}
										showFavorite={true}
										favoriteElement={
											isProcessFavorite ? (
												<FavoriteIcon
													cursor="pointer"
													onClick={toggleFavoriteProcess}
												/>
											) : (
												<UnFavoriteIcon
													cursor="pointer"
													onClick={toggleFavoriteProcess}
												/>
											)
										}
									>
										<Flex alignItems="center" gap={1} overflow="hidden" minWidth={0}>
											<SvgIcon
												iconName="home"
												size={isMobile ? 20 : 24}
												cursor="pointer"
												onClick={() =>
													navigate(routes.dashboard.value, { replace: true })
												}
											/>
											<ChevronRightIcon />
											<Text
												cursor="pointer"
												fontWeight={500}
												color={'primary.700'}
												fontSize={isMobile ? "sm" : "md"}
												onClick={() =>
													navigate(routes.processes.value, { replace: true })
												}
												flexShrink={0}
											>
												Processes
											</Text>
											{processStore?.process && (
												<>
													<ChevronRightIcon />
													<Text 
														color="gray.700" 
														fontWeight={600}
														fontSize={isMobile ? "sm" : "md"}
														noOfLines={1}
														title={processStore?.process?.name ?? ''}
														minWidth={0}
													>
														{processStore?.process?.name ?? ''}
													</Text>
												</>
											)}
										</Flex>
									</ResponsiveBreadcrumb>
								}
								controlBy="processDetail"
							/>
						)}

						{/* -----------COLLECTION-------------- */}
						{!!matchPath(location?.pathname, routes.collections.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.collections.value, { replace: true })
											}
										>
											Collections
										</Text>
									</HStack>
								}
								controlBy="collectionPage"
							/>
						)}

						{/* -----------COLLECTION DETAIL-------------- */}
						{!!matchPath(
							`${routes.collections.value}/:collectionId`,
							location?.pathname
						) && (
							<HeaderBar
								title={
									<ResponsiveBreadcrumb
										isMobile={isMobile}
										showFavorite={true}
										favoriteElement={
											isCollectionFavorite ? (
												<FavoriteIcon
													cursor="pointer"
													onClick={toggleFavoriteCollection}
												/>
											) : (
												<UnFavoriteIcon
													cursor="pointer"
													onClick={toggleFavoriteCollection}
												/>
											)
										}
									>
										<Flex alignItems="center" gap={1} overflow="hidden" minWidth={0}>
											<SvgIcon
												iconName="home"
												size={isMobile ? 20 : 24}
												cursor="pointer"
												onClick={() =>
													navigate(routes.dashboard.value, { replace: true })
												}
											/>
											<ChevronRightIcon />
											<Text
												cursor="pointer"
												fontWeight={500}
												color={'primary.700'}
												fontSize={isMobile ? "sm" : "md"}
												onClick={() =>
													navigate(routes.collections.value, { replace: true })
												}
												flexShrink={0}
											>
												Collections
											</Text>
											{collectionStore?.collection && (
												<>
													<ChevronRightIcon />
													<Text 
														color="gray.700" 
														fontWeight={600}
														fontSize={isMobile ? "sm" : "md"}
														noOfLines={1}
														title={collectionStore?.collection?.name ?? ''}
														minWidth={0}
													>
														{collectionStore?.collection?.name ?? ''}
													</Text>
												</>
											)}
										</Flex>
									</ResponsiveBreadcrumb>
								}
								controlBy="collectionDetailPage"
							/>
						)}

						{/* ------------USER------------- */}
						{!!matchPath(location?.pathname, routes.users.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.users.value, { replace: true })
											}
										>
											Users
										</Text>
									</HStack>
								}
								controlBy="userPage"
								isManageMode={userStore.isManageMode}
							/>
						)}

						{/* ------------ADMIN------------- */}
						{!!matchPath(location?.pathname, routes.admins.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.admins.value, { replace: true })
											}
										>
											Admins
										</Text>
									</HStack>
								}
								controlBy="userPage"
								isManageMode={userStore.isManageMode}
							/>
						)}

						{/* ------------USER DETAIL------------- */}
						{!!matchPath('/users/:userId', location?.pathname) && (
							<HeaderBar
								title={
									<HStack spacing={1} overflow="hidden">
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											color={'primary.700'}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.users.value, { replace: true })
											}
										>
											Users
										</Text>
										{userStore?.userDetail && (
											<>
												<ChevronRightIcon />
												<Text 
													color="gray.700"
													fontSize={isMobile ? "sm" : "md"}
													noOfLines={1}
													title={getName(userStore?.userDetail) ?? ''}
												>
													{getName(userStore?.userDetail) ?? ''}
												</Text>
											</>
										)}
									</HStack>
								}
								controlBy="userDetailPage"
								isManageMode={userStore.isManageModeInUserDetail}
							/>
						)}

						{/* -------------GROUP------------ */}
						{!!matchPath(location?.pathname, routes.groups.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.groups.value, { replace: true })
											}
										>
											Groups
										</Text>
									</HStack>
								}
								isManageMode={groupStore.isManageMode}
								setIsManageMode={groupStore.setManageMode}
								controlBy="groupPage"
							/>
						)}

						{/* -------------GROUP DETAIL------------ */}
						{!!matchPath('/groups/:groupId', location?.pathname) && (
							<HeaderBar
								title={
									<HStack spacing={1} overflow="hidden">
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											color={'primary.700'}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.groups.value, { replace: true })
											}
										>
											Groups
										</Text>
										{groupStore?.groupDetail && (
											<>
												<ChevronRightIcon />
												<Text 
													color="gray.700"
													fontSize={isMobile ? "sm" : "md"}
													noOfLines={1}
													title={groupStore?.groupDetail?.name ?? ''}
												>
													{groupStore?.groupDetail?.name ?? ''}
												</Text>
											</>
										)}
									</HStack>
								}
								controlBy="groupMemberList"
							/>
						)}

						{/*-------------DOCUMENT TYPE------------ */}
						{!!matchPath(
							location?.pathname,
							routes.setting.documentType.value
						) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.setting.documentType.value, {
													replace: true,
												})
											}
										>
											Document Types
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}

						{/* ---------------TAG------------------ */}
						{!!matchPath(location?.pathname, routes.setting.tag.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.setting.tag.value, {
													replace: true,
												})
											}
										>
											Tags
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}

						{/* ---------------NOTIFICATION------------------ */}
						{!!matchPath(location?.pathname, routes.notifications.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.setting.tag.value, {
													replace: true,
												})
											}
										>
											Notifications
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}

						{/* ----------------DASHBOARD----------------- */}
						{(!!matchPath(location?.pathname, routes.dashboard.value) ||
							!!matchPath(location?.pathname, routes.home.value)) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										>
											Dashboard
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}

						{/*-------------ICON BUILDER------------ */}
						{!!matchPath(
							location?.pathname,
							routes.setting.iconBuilder.value
						) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.setting.iconBuilder.value, {
													replace: true,
												})
											}
										>
											Icon Builder
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}

						{/* ----------------ORGANIZATION----------------- */}
						{!!matchPath(location?.pathname, routes.organizations.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										>
											Organization
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}

						{/* ------------ORGANIZATION DETAIL------------- */}
						{!!matchPath(
							'/organizations/:organizationId',
							location?.pathname
						) && (
							<HeaderBar
								title={
									<HStack spacing={1} overflow="hidden">
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											color={'primary.700'}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										>
											Organization
										</Text>
										{reportStore?.companyReportDetail && (
											<>
												<ChevronRightIcon />
												<Text 
													color="gray.700"
													fontSize={isMobile ? "sm" : "md"}
													noOfLines={1}
													title={reportStore?.companyReportDetail?.name ?? ''}
												>
													{reportStore?.companyReportDetail?.name ?? ''}
												</Text>
											</>
										)}
									</HStack>
								}
							/>
						)}

						{/* ----------------MESSAGE----------------- */}
						{!!matchPath(location?.pathname, routes.messages.value) && (
							<HeaderBar
								title={
									<HStack spacing={1}>
										<SvgIcon
											iconName="home"
											size={isMobile ? 20 : 24}
											cursor="pointer"
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										/>
										<ChevronRightIcon />
										<Text
											cursor="pointer"
											fontWeight={500}
											fontSize={isMobile ? "sm" : "md"}
											onClick={() =>
												navigate(routes.dashboard.value, { replace: true })
											}
										>
											Messages
										</Text>
									</HStack>
								}
								hasManageMode={false}
							/>
						)}
					</Flex>
				</Stack>
			</div>
		</React.Fragment>
	);
};

export default observer(TopBar);