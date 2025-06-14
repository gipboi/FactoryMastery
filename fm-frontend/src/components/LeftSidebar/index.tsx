import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { ReactComponent as CollectionIcon } from 'assets/icons/collection.svg';
import { ReactComponent as DashboardIcon } from 'assets/icons/dashboard.svg';
import { ReactComponent as DocumentTypeIcon } from 'assets/icons/document-type.svg';
import { ReactComponent as GroupIcon } from 'assets/icons/group.svg';
import { ReactComponent as LogoutIcon } from 'assets/icons/log-out.svg';
import { ReactComponent as ProcessIcon } from 'assets/icons/process.svg';
import { ReactComponent as IconBuilderIcon } from 'assets/icons/sidebar-icon-builder.svg';
import { ReactComponent as TagIcon } from 'assets/icons/tag.svg';
import { ReactComponent as UserIcon } from 'assets/icons/user.svg';
import { ReactComponent as MessageIcon } from 'assets/icons/message.svg';
import { ReactComponent as StatisticIcon } from 'assets/icons/statistical.svg';
import LogoIcon from 'assets/images/logo-left-sidebar.png';
import TextLogoIcon from 'assets/images/text-logo.png';
import cx from 'classnames';
import { SUPER_ADMIN_DOMAIN } from 'constants/admin';
import { AuthRoleNameEnum } from 'constants/user';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import React from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import routes from 'routes';
import { getSubdomain } from 'utils/domain';
import styles from './leftSidebar.module.scss';
import { LeftSideBarIdEnum } from 'constants/enums';
import useBreakPoint from 'hooks/useBreakPoint';
import { EBreakPoint } from 'constants/theme';

interface ILeftSidebarProps {
	showSidebarMobile: boolean;
	setShowSidebarMobile: (showSidebarMobile: boolean) => void;
}

const items = [
	{
		id: LeftSideBarIdEnum.DASH_BOARD,
		title: 'Dashboard',
		icon: <DashboardIcon width={24} height={24} />,
		link: routes.dashboard.value,
	},
];
const operationItems = [
	{
		id: LeftSideBarIdEnum.COLLECTION,
		title: 'Collections',
		icon: <CollectionIcon width={24} height={24} />,
		link: routes.collections.value,
	},
	{
		id: LeftSideBarIdEnum.PROCESS,
		title: 'Processes',
		icon: <ProcessIcon width={24} height={24} />,
		link: routes.processes.value,
	},
	{
		id: LeftSideBarIdEnum.USER,
		title: 'Users',
		icon: <UserIcon width={24} height={24} />,
		link: routes.users.value,
	},
	{
		id: LeftSideBarIdEnum.GROUP,
		title: 'Groups',
		icon: <GroupIcon width={24} height={24} />,
		link: routes.groups.value,
	},
	{
		id: LeftSideBarIdEnum.MESSAGE,
		title: 'Messages',
		icon: <MessageIcon width={24} height={24} />,
		link: routes.messages.value,
	},
	{
		id: LeftSideBarIdEnum.REPORT,
		title: 'Reports',
		icon: <StatisticIcon width={24} height={24} />,
		link: routes.reports.value,
	}
];

const adminOperationItems = [
	{
		id: LeftSideBarIdEnum.ADMIN,
		title: 'Admins',
		icon: <UserIcon width={24} height={24} />,
		link: routes.admins.value,
	},
];

const settingItems = [
	{
		id: LeftSideBarIdEnum.DOCUMENT_TYPE,
		title: 'Document Types',
		icon: <DocumentTypeIcon width={24} height={24} />,
		link: routes.setting.documentType.value,
	},
	{
		id: LeftSideBarIdEnum.TAG,
		title: 'Tags',
		icon: <TagIcon width={24} height={24} />,
		link: routes.setting.tag.value,
	},
	{
		id: LeftSideBarIdEnum.ICON_BUILDER,
		title: 'Icon Builder',
		icon: <IconBuilderIcon width={24} height={24} />,
		link: routes.setting.iconBuilder.value,
	},
];

const LeftSidebar = (props: ILeftSidebarProps) => {
	const { showSidebarMobile, setShowSidebarMobile } = props;
	const location = useLocation();
	const subDomain = getSubdomain();
	const { authStore, organizationStore } = useStores();
	const { organization } = organizationStore;
	const isBasicUser: boolean =
		authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

	const isSuperAdmin: boolean = subDomain === SUPER_ADMIN_DOMAIN;
	const filterOperationItems = operationItems.filter((item) => {
		if (
			item.id === LeftSideBarIdEnum.COLLECTION &&
			!organization?.isCollectionFeature
		) {
			return false;
		}
		if (item.id === LeftSideBarIdEnum.MESSAGE && !organization?.isReportTool) {
			return false;
		}
		return true;
	});

	const listOperationItems = isSuperAdmin
		? adminOperationItems
		: filterOperationItems;
	const listSettingItems = settingItems.filter((item) => {
		if (
			item.id === LeftSideBarIdEnum.ICON_BUILDER &&
			!organization?.isThemeSetting
		) {
			return false;
		}
		return true;
	});

	return (
		<>
			{isMobile && showSidebarMobile && (
				<div
					className={cx(styles.sidebarOverlay, styles.sidebarOverlayVisible)}
					onClick={() => setShowSidebarMobile(false)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						zIndex: 998,
					}}
				/>
			)}
			<div
				className={cx(styles.leftSideMenu, {
					[styles.leftSideMenuMobile]: !showSidebarMobile,
				})}
				style={{
          transform: isMobile 
            ? showSidebarMobile 
              ? 'translateX(0)' 
              : 'translateX(-100%)'
            : 'translateX(0)',
          zIndex: isMobile ? 999 : 'auto',
          transition: isMobile 
            ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'width 0.3s ease-out, background-color 0.3s ease-out',
        }}
			>
				<React.Fragment>
					<VStack spacing={0}>
						<Flex
							className={styles.logoSection}
							justifyContent="flex-start"
							w="full"
							paddingX={6}
							paddingY={4}
							onClick={() => setShowSidebarMobile(!showSidebarMobile)}
						>
							<HStack spacing={2}>
								{/* <img src={LogoIcon} width={24} height={24} alt="Logo" /> */}
								{showSidebarMobile ? (
									<img
										src={TextLogoIcon}
										width={210}
										height={60}
										alt="Text Logo"
										color="$primary"
									/>
								) : (
									<img src={LogoIcon} width={30} height={45} alt="Logo" />
								)}
							</HStack>
						</Flex>
						{items.map((item) => {
							if (isBasicUser && item.link?.includes(routes.setting.value)) {
								return null;
							}
							return (
								<Link
									key={item.id}
									className={cx(styles.pageLink, {
										[styles.pageLinkActive]: location?.pathname.includes(
											item?.link
										),
									})}
									to={item.link}
								>
									<Flex
										justifyContent={
											!showSidebarMobile ? 'center' : 'flex-start'
										}
										w="full"
										paddingX={6}
										paddingY={4}
									>
										<HStack spacing={2}>
											<>{item.icon}</>
											{showSidebarMobile && (
												<Text className={styles.pageContent}>{item.title}</Text>
											)}
										</HStack>
									</Flex>
								</Link>
							);
						})}

						{/* Add Section Header for Operations */}
						{showSidebarMobile && (
							<Text className={cx(styles.sectionHeader)}>OPERATIONS</Text>
						)}
						{listOperationItems.map((item) => {
							if (isBasicUser && item.link?.includes(routes.setting.value)) {
								return null;
							}
							return (
								<Link
									key={item.id}
									className={cx(styles.pageLink, {
										[styles.pageLinkActive]: location?.pathname.includes(
											item?.link
										),
									})}
									to={item.link}
								>
									<Flex
										justifyContent={
											!showSidebarMobile ? 'center' : 'flex-start'
										}
										w="full"
										paddingX={6}
										paddingY={4}
									>
										<HStack spacing={2}>
											<>{item.icon}</>
											{showSidebarMobile && (
												<Text className={styles.pageContent}>{item.title}</Text>
											)}
										</HStack>
									</Flex>
								</Link>
							);
						})}

						{/* Add Section Header for Settings */}
						{!isSuperAdmin && (
							<>
								{showSidebarMobile && !isBasicUser && (
									<>
										<Text className={cx(styles.sectionHeader)}>SETTINGS</Text>
									</>
								)}
								{listSettingItems.map((item) => {
									if (
										isBasicUser &&
										item.link?.includes(routes.setting.value)
									) {
										return null;
									}
									return (
										<Link
											key={item.id}
											className={cx(styles.pageLink, {
												[styles.pageLinkActive]: location?.pathname.includes(
													item?.link
												),
											})}
											to={item.link}
										>
											<Flex
												justifyContent={
													!showSidebarMobile ? 'center' : 'flex-start'
												}
												w="full"
												paddingX={6}
												paddingY={4}
											>
												<HStack spacing={2}>
													<>{item.icon}</>
													{showSidebarMobile && (
														<Text className={styles.pageContent}>
															{item.title}
														</Text>
													)}
												</HStack>
											</Flex>
										</Link>
									);
								})}
							</>
						)}

						{/* {showSidebarMobile && (
            <hr className={styles.separator} style={{ marginTop: "24px" }} />
          )} */}
						<Link
							className={cx(styles.pageLink, {
								[styles.pageLinkActive]: !!matchPath(
									location?.pathname,
									routes.logout.value
								),
							})}
							to={routes.logout.value}
							onClick={(e) => {
								e.preventDefault();
								authStore.logout();
							}}
						>
							<Flex
								justifyContent={!showSidebarMobile ? 'center' : 'flex-start'}
								w="full"
								paddingX={6}
								paddingY={4}
							>
								<HStack spacing={2}>
									<LogoutIcon width={24} height={24} />
									{showSidebarMobile && (
										<Text className={styles.pageContent}>Log out</Text>
									)}
								</HStack>
							</Flex>
						</Link>
					</VStack>
				</React.Fragment>
			</div>
		</>
	);
};

export default observer(LeftSidebar);
