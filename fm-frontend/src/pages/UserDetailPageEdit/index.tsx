/* eslint-disable max-lines */
import {
	Box,
	chakra,
	FormLabel,
	HStack,
	Radio,
	RadioGroup,
	SimpleGrid,
	Switch,
	Text,
	useDisclosure,
	VStack,
	Stack,
	Flex,
	Wrap,
	WrapItem,
} from '@chakra-ui/react';
import { uploadFile } from 'API/cms';
import { updateUserById, updateUserPermissionById } from 'API/user';
import Avatar from 'components/Avatar';
import FormInput from 'components/Chakra/FormInput';
import { ReactComponent as IconTrashRed } from 'assets/icons/trash-red.svg';
import DeleteDialog from 'components/DeleteDialog';
import SvgIcon from 'components/SvgIcon';
import { GroupMemberPermissionEnum } from 'constants/enums/group';
import { AuthRoleIdEnum, AuthRoleNameEnum } from 'constants/user';
import { useStores } from 'hooks/useStores';
import { ITheme } from 'interfaces/theme';
import {
	ICreateEditUserRequest,
	IUserDetailForm,
	IUserWithRelations,
} from 'interfaces/user';
import { startCase } from 'lodash';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import { filter } from 'pages/UserDetailPage/constants';
import CustomButton from 'pages/UserPage/components/CustomButton';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import routes from 'routes';
import { getValidArray } from 'utils/common';
import {
	checkDuplicateUserInOrganization,
	getFirstAndLastName,
} from 'utils/user';
import ResetPasswordModal from './components/ResetPasswordModal';
import { primary500 } from 'themes/globalStyles';
import { filterUserDetail } from 'components/UserDetailPage/utils';
import { IFilter } from 'types/common';
import NewGeneralMessageModal from 'pages/InboxPage/GeneralInbox/components/NewGeneralModal';
import ERRORS from 'config/errors';
import useBreakPoint from 'hooks/useBreakPoint';
import { EBreakPoint } from 'constants/theme';

const initialFormValues: IUserDetailForm = {
	fullName: '',
	username: '',
	email: '',
	password: '',
	phone: '',
	userType: String(AuthRoleNameEnum.MANAGER),
	groupPermissions: [],
};

const UserDetailPageEdit = () => {
	const params = useParams();
	const userId = String(get(params, 'userId', '') ?? '');
	const { userStore, groupStore, authStore, organizationStore } = useStores();
	const { organization } = organizationStore;
	const isBasicUser =
		authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);

	const currentTheme: ITheme = organization?.theme ?? {};
	const { userDetail, currentUser } = userStore;
	const currentUserRole: string = currentUser?.authRole ?? '';
	const { groups } = groupStore;
	const groupOptions = Array.isArray(groups)
		? groups.map((group) => ({
				groupId: group.id,
				permissionId: GroupMemberPermissionEnum.VIEWER,
				admin: false,
		  }))
		: [];
	const methods = useForm<IUserDetailForm>({
		reValidateMode: 'onChange',
		mode: 'onChange',
		defaultValues: userDetail?.id ? userDetail : initialFormValues,
	});
	const {
		reset,
		control,
		formState: { isDirty },
	} = methods;
	const navigate = useNavigate();

	const userType = useWatch({ control, name: 'userType' });
	const usernameWatcher = useWatch({ control, name: 'username' });
	const emailWatcher = useWatch({ control, name: 'email' });

	const fileInputRef = useRef<any>(null);
	const [selectedFile, setSelectedFile] = useState<any>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isReportTool, setIsReportTool] = useState<boolean>(false);
	const [isMessageFullAccess, setIsMessageFullAccess] =
		useState<boolean>(false);
	const [isPermissionFormDirty, setIsPermissionFormDirty] =
		useState<boolean>(false);
	const [isPermissionFormLoading, setIsPermissionFormLoading] =
		useState<boolean>(false);
	const {
		isOpen: isOpenResetPasswordModal,
		onOpen: openResetPasswordModal,
		onClose: closeResetPasswordModal,
	} = useDisclosure();
	const {
		isOpen: isOpenMessageModal,
		onOpen: openMessageModal,
		onClose: closeMessageModal,
	} = useDisclosure();

	const {
		isOpen: isOpenDelete,
		onOpen: onOpenDelete,
		onClose: onCloseDelete,
	} = useDisclosure();

	const isEditMyself: boolean =
		String(currentUser?.id) === String(userDetail?.id);
	const isHideSendMessage: boolean =
		(currentUserRole === AuthRoleIdEnum.BASIC_USER &&
			userDetail?.authRole === AuthRoleIdEnum.BASIC_USER) ||
		isEditMyself;
	const imageUrl = userDetail?.image
		? (userDetail?.organizationId ?? '', userDetail.image)
		: '';

	async function validateUsernameAndEmail(
		value: string,
		fieldName: 'email' | 'username'
	) {
		if (!value || value === userDetail?.[fieldName]) {
			return;
		}
		const haveDuplicate = await checkDuplicateUserInOrganization(
			value,
			userDetail?.organizationId ?? '',
			fieldName,
			true
		);
		if (haveDuplicate) {
			methods.setError(fieldName, {
				message: `${startCase(fieldName)} exists`,
			});
		} else {
			methods.clearErrors(fieldName);
		}
	}

	async function onSelectFile(event: ChangeEvent<HTMLInputElement>) {
		if (!event.target.files || event.target.files.length === 0) {
			setSelectedFile(undefined);
			return;
		}

		setSelectedFile(event.target.files[0]);
		try {
			const url = await uploadFile(
				userDetail?.organizationId ?? '',
				'image',
				event.target.files[0]
			);
			await updateUserById(userDetail?.id ?? '', {
				image: url,
			});
		} catch (error: any) {
			toast.error('Something wrong when upload picture');
		}
	}

	useEffect(() => {
		if (usernameWatcher) {
			validateUsernameAndEmail(usernameWatcher, 'username');
		}
		if (emailWatcher) {
			validateUsernameAndEmail(emailWatcher, 'email');
		}
	}, [usernameWatcher, emailWatcher]);

	useEffect(() => {
		if (userDetail?.id) {
			reset({
				...userDetail,
				userType: String(userDetail?.authRole),
				groupPermissions: getValidArray(userDetail?.groupMembers)
					?.map((groupMember) => {
						const foundOption = groupOptions.find(
							(option) => option.groupId === groupMember.groupId
						);
						return foundOption
							? {
									...foundOption,
									admin: groupMember.admin,
									permissionId: groupMember.permission,
							  }
							: null;
					})
					.filter(Boolean) as { admin: boolean; groupId: string }[],
			});
			setIsReportTool(userDetail?.isReportTool ?? false);
			setIsMessageFullAccess(userDetail?.isMessageFullAccess ?? false);
			setIsPermissionFormDirty(false);
		}
	}, [userDetail]);

	useEffect(() => {
		if (userId) {
			userStore.getUserDetail(
				userId ?? '',
				filterUserDetail as IFilter<IUserWithRelations>
			);
		}
	}, [userId]);

	async function onSubmit(values: IUserDetailForm): Promise<void> {
		setIsLoading(true);
		try {
			const fullName = values.fullName.trim();
			const { firstName, lastName } = getFirstAndLastName(fullName);

			const updatedUserData: ICreateEditUserRequest = {
				username: values?.username ?? undefined,
				email: values?.email ?? undefined,
				password: values?.password ?? undefined,
				firstName: fullName ? firstName : undefined,
				lastName: fullName ? lastName : undefined,
				authRole: String(values?.userType) ?? AuthRoleNameEnum.BASIC_USER,
				groups:
					Array.isArray(values?.groupPermissions) &&
					String(values?.userType) === AuthRoleNameEnum.BASIC_USER
						? values?.groupPermissions?.map((group) => ({
								groupId: group?.groupId,
								permission: group?.permission as GroupMemberPermissionEnum,
								admin: group?.admin,
						  }))
						: [],
				mobilePhone: values?.phone,
				workPhone: values?.phone,
			};
			await updateUserById(userId, updatedUserData);
			await userStore.getUserDetail(userId ?? 0, filter);
			toast.success('Update user successfully!');
			userStore.setManageModeInUserDetail(false);
		} catch (error: any) {
			toast.error(
				error?.response?.data.error.message ??
					'Failed to update user. Please try again or contact support.'
			);
		} finally {
			setIsLoading(false);
		}
	}

	async function handleSubmitPermission(): Promise<void> {
		try {
			setIsPermissionFormLoading(true);
			await userStore.updateUser(userId, { isMessageFullAccess, isReportTool });
			userStore.setUserDetail({ isMessageFullAccess, isReportTool });
			toast.success('Update permission successfully!');
		} catch (error) {
			console.error(error);
			toast.error('Update permission failed!');
		} finally {
			setIsPermissionFormDirty(false);
			setIsPermissionFormLoading(false);
			userStore.setManageModeInUserDetail(false);
		}
	}

	async function deleteUser(): Promise<void> {
		try {
			await updateUserById(userId, { disabled: true }); //*INFO: disable user instead of delete
			toast.success('Delete user successfully!');
			navigate(routes.users.value);
		} catch (error: any) {
			toast.error(
				error?.response?.data.error.message ??
					'Failed to delete user. Please try again or contact support.'
			);
		}
	}

	async function handleDisableEnableUsers(): Promise<void> {
		try {
			await updateUserById(userId, { disabled: !userDetail?.disabled });
			toast.success(
				`${!userDetail?.disabled ? 'Disable' : 'Enable'}  user successfully!`
			);
			userStore.setManageModeInUserDetail(false);
		} catch (error: any) {
			toast.error(
				error?.response?.data.error.message ??
					`Failed to ${
						!userDetail?.disabled ? 'disable' : 'enable'
					} user. Please try again or contact support.`
			);
		}
	}

	const PermissionField = ({
		label,
		isChecked,
		onChange,
		isDisabled,
	}: {
		label: string;
		isChecked: boolean;
		onChange: (checked: boolean) => void;
		isDisabled: boolean;
	}) => (
		<Stack
			direction={{ base: 'column', md: 'row' }}
			alignItems={{ base: 'flex-start', md: 'flex-start' }}
			spacing={{ base: 2, md: 4 }}
			width="full"
		>
			<Text
				width={{ base: 'full', md: '168px' }}
				color="gray.700"
				fontSize="14px"
				fontWeight="600"
				lineHeight="20px"
				flexShrink={0}
			>
				{label}
			</Text>
			<HStack>
				<Switch
					margin={0}
					isChecked={isChecked}
					colorScheme="primary"
					isDisabled={isDisabled}
					onChange={(event) => onChange(event?.target?.checked)}
					size={{ base: 'sm', md: 'md' }}
				/>
				<Text
					color="gray.700"
					fontSize="16px"
					fontWeight="400"
					lineHeight="24px"
				>
					{isChecked ? 'On' : 'Off'}
				</Text>
			</HStack>
		</Stack>
	);

	return (
		<VStack
			width="full"
			height="full"
			spacing={{ base: 4, md: 6 }}
			px={{ base: 4, md: 0 }}
			py={{ base: 4, md: 0 }}
		>
			{!isHideSendMessage && (
				<Flex
					justifyContent="flex-end"
					width="full"
					flexWrap="wrap"
					gap={{ base: 2, md: 3 }}
				>
					{organization?.isReportTool && (
						<CustomButton
							content="Send message"
							fontSize={{ base: '14px', md: '16px' }}
							className="outline"
							color="gray.700"
							fontWeight="500"
							height={{ base: '36px', md: '40px' }}
							leftIcon={<SvgIcon iconName="outline-message" size={16} />}
							margin={0}
							onClick={openMessageModal}
							background="white"
							px={{ base: 3, md: 4 }}
						/>
					)}
					<CustomButton
						content={userDetail?.disabled ? 'Enable' : 'Disable'}
						fontSize={{ base: '14px', md: '16px' }}
						className="outline"
						color="gray.700"
						fontWeight="500"
						height={{ base: '36px', md: '40px' }}
						leftIcon={<SvgIcon iconName="account-cancel" size={16} />}
						margin={0}
						onClick={handleDisableEnableUsers}
						background="white"
						disabled={isEditMyself}
						px={{ base: 3, md: 4 }}
					/>
					<CustomButton
						content="Delete"
						fontSize={{ base: '14px', md: '16px' }}
						className="outline"
						color="red.500"
						borderColor="red.500"
						fontWeight="500"
						height={{ base: '36px', md: '40px' }}
						leftIcon={<IconTrashRed />}
						margin={0}
						onClick={onOpenDelete}
						background="white"
						disabled={isEditMyself}
						px={{ base: 3, md: 4 }}
					/>
					<DeleteDialog
						title="Delete user"
						isOpen={isOpenDelete}
						message="Are you sure you want to delete this user?"
						toggle={onCloseDelete}
						onDelete={deleteUser}
						onCancel={onCloseDelete}
					/>
				</Flex>
			)}

			<Stack
				direction={{ base: 'column', lg: 'row' }}
				spacing={{ base: 4, md: 6 }}
				width="full"
				alignItems={{ base: 'stretch', lg: 'flex-start' }}
			>
				{/* Main Content */}
				<VStack width="full" spacing={{ base: 4, md: 6 }} flex={1}>
					{/* Detail Form Section */}
					<FormProvider {...methods}>
						<chakra.form onSubmit={methods.handleSubmit(onSubmit)} width="full">
							<VStack
								width="full"
								background="white"
								borderRadius="8px"
								alignItems="flex-start"
								alignSelf="flex-start"
								padding={{ base: 3, md: 4 }}
								spacing={{ base: 3, md: 4 }}
							>
								<Stack
									direction={{ base: 'column', sm: 'row' }}
									spacing={{ base: 2, sm: 4 }}
									minWidth="max-content"
									justifyContent="space-between"
									width="100%"
									alignItems={{ base: 'flex-start', sm: 'center' }}
								>
									<Text
										fontSize={{ base: '16px', md: '18px' }}
										color="gray.800"
										fontWeight="600"
										lineHeight="28px"
										marginBottom={0}
									>
										Detail
									</Text>

									<CustomButton
										size="sm"
										content="Save"
										fontSize={{ base: '12px', md: '14px' }}
										background={currentTheme?.primaryColor ?? 'primary.700'}
										color="#ffffff"
										type="submit"
										isLoading={isLoading}
										isDisabled={!isDirty}
										leftIcon={<SvgIcon iconName="ic-save" size={14} />}
										height={{ base: '32px', md: 'auto' }}
										px={{ base: 3, md: 4 }}
										_hover={{
											opacity: !isDirty ? 0.6 : 1,
											background: currentTheme?.primaryColor ?? 'primary.700',
										}}
										_active={{
											background: currentTheme?.primaryColor ?? 'primary.700',
										}}
										onClick={() => {}}
									/>
								</Stack>

								<SimpleGrid
									columns={{ base: 1, md: 2 }}
									columnGap={4}
									rowGap={{ base: 4, md: 6 }}
									width="full"
								>
									<FormInput
										name="username"
										label="User Name"
										autoComplete="off"
									/>
									<FormInput
										name="fullName"
										label="Full Name"
										autoComplete="off"
									/>
									<FormInput
										name="phone"
										label="Phone Number"
										autoComplete="off"
										pattern={{
											value:
												/^\+?([0-9]{1,3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})|^[0-9]{10}$/,
											message: 'Please enter a valid phone number',
										}}
									/>
									<FormInput
										name="email"
										label="Email Address"
										autoComplete="off"
										hideErrorMessage={false}
										pattern={{
											value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
											message: 'Please enter a valid email address',
										}}
									/>
									<Box>
										<FormLabel
											color="gray.700"
											lineHeight={6}
											marginBottom={0}
											marginInlineEnd={0}
											minWidth="200px"
											fontSize={{ base: '14px', md: '16px' }}
										>
											Password
										</FormLabel>
										<Text
											color={currentTheme?.primaryColor ?? primary500}
											fontWeight="600"
											fontSize={{ base: '14px', md: '16px' }}
											lineHeight="24px"
											marginBottom={0}
											marginTop={4}
											cursor="pointer"
											onClick={openResetPasswordModal}
										>
											Reset Password
										</Text>
									</Box>
								</SimpleGrid>

								<FormInput name="userType" label="User type">
									<Controller
										name="userType"
										control={methods.control}
										rules={{ required: true }}
										render={({ field }) => (
											<RadioGroup
												marginTop={2}
												{...field}
												value={String(field.value)}
											>
												<Stack
													direction={{ base: 'column', sm: 'row' }}
													spacing={{ base: 2, sm: 14 }}
													alignItems="flex-start"
													color="gray.700"
												>
													{currentUser?.authRole ===
														AuthRoleNameEnum.ORG_ADMIN && (
														<Radio
															colorScheme="primary"
															value={AuthRoleNameEnum.ORG_ADMIN}
															size={{ base: 'sm', md: 'md' }}
														>
															<Text fontSize={{ base: '14px', md: '16px' }}>
																{AuthRoleNameEnum.ORG_ADMIN}
															</Text>
														</Radio>
													)}
													<Radio
														colorScheme="primary"
														value={AuthRoleNameEnum.MANAGER}
														size={{ base: 'sm', md: 'md' }}
													>
														<Text fontSize={{ base: '14px', md: '16px' }}>
															{AuthRoleNameEnum.MANAGER}
														</Text>
													</Radio>
													<Radio
														colorScheme="primary"
														value={AuthRoleNameEnum.BASIC_USER}
														size={{ base: 'sm', md: 'md' }}
													>
														<Text fontSize={{ base: '14px', md: '16px' }}>
															{AuthRoleNameEnum.BASIC_USER}
														</Text>
													</Radio>
												</Stack>
											</RadioGroup>
										)}
									/>
								</FormInput>
							</VStack>
						</chakra.form>
					</FormProvider>

					{/* Permission Section */}
					<VStack
						width="full"
						background="white"
						borderRadius="8px"
						alignItems="flex-start"
						padding={{ base: 3, md: 4 }}
						spacing={{ base: 3, md: 4 }}
					>
						<Stack
							direction={{ base: 'column', sm: 'row' }}
							spacing={{ base: 2, sm: 4 }}
							minWidth="max-content"
							justifyContent="space-between"
							width="100%"
							alignItems={{ base: 'flex-start', sm: 'center' }}
						>
							<Text
								fontSize={{ base: '16px', md: '18px' }}
								color="gray.800"
								fontWeight="600"
								lineHeight="28px"
								marginBottom={0}
							>
								Permission
							</Text>

							<CustomButton
								size="sm"
								content="Save"
								fontSize={{ base: '12px', md: '14px' }}
								background={currentTheme?.primaryColor ?? 'primary.700'}
								color="white"
								isLoading={isPermissionFormLoading}
								isDisabled={!isPermissionFormDirty}
								leftIcon={<SvgIcon iconName="ic-save" size={14} />}
								height={{ base: '32px', md: 'auto' }}
								px={{ base: 3, md: 4 }}
								_hover={{
									opacity: !isPermissionFormDirty ? 0.6 : 1,
									background: currentTheme?.primaryColor ?? 'primary.700',
								}}
								_active={{
									background: currentTheme?.primaryColor ?? 'primary.700',
								}}
								onClick={handleSubmitPermission}
							/>
						</Stack>

						<VStack
							alignItems="flex-start"
							spacing={{ base: 3, md: 4 }}
							width="full"
						>
							<PermissionField
								label="Report tool"
								isChecked={isReportTool}
								onChange={(checked) => {
									setIsReportTool(checked);
									setIsPermissionFormDirty(true);
								}}
								isDisabled={isBasicUser}
							/>
							<PermissionField
								label="Message full access"
								isChecked={isMessageFullAccess}
								onChange={(checked) => {
									setIsMessageFullAccess(checked);
									setIsPermissionFormDirty(true);
								}}
								isDisabled={isBasicUser}
							/>
						</VStack>
					</VStack>
				</VStack>

				{/* Profile Picture Section */}
				<VStack
					backgroundColor="#FFFFFF"
					borderRadius="8px"
					padding={{ base: 3, md: 4 }}
					spacing={{ base: 3, md: 4 }}
					minWidth={{ base: 'full', lg: '313px' }}
					maxWidth={{ base: 'full', lg: '313px' }}
					alignSelf={{ base: 'stretch', lg: 'flex-start' }}
				>
					<Text
						alignSelf="flex-start"
						fontSize={{ base: '16px', md: '18px' }}
						color="gray.800"
						fontWeight="600"
						lineHeight="28px"
						marginBottom={0}
					>
						Profile Picture
					</Text>
					<Box alignSelf={{ base: 'center', lg: 'center' }}>
						<Avatar
							isLarge
							src={
								selectedFile
									? URL.createObjectURL(selectedFile)
									: imageUrl ?? ''
							}
							name={userDetail?.fullName ?? ''}
						/>
					</Box>
					<input
						type="file"
						ref={fileInputRef}
						onChange={onSelectFile}
						style={{ display: 'none' }}
					/>
					<CustomButton
						content="Change image"
						width="full"
						fontSize={{ base: '14px', md: '16px' }}
						background="#ffffff"
						border="1px solid #E2E8F0"
						color="gray.700"
						leftIcon={<SvgIcon iconName="ic-upload" size={16} />}
						onClick={() => fileInputRef?.current?.click()}
						height={{ base: '40px', md: 'auto' }}
					/>
				</VStack>
			</Stack>

			<ResetPasswordModal
				isOpen={isOpenResetPasswordModal}
				toggle={
					isOpenResetPasswordModal
						? closeResetPasswordModal
						: openResetPasswordModal
				}
			/>
			<NewGeneralMessageModal
				isOpen={isOpenMessageModal}
				onClose={closeMessageModal}
				recipient={userDetail as IUserWithRelations}
			/>
		</VStack>
	);
};

export default observer(UserDetailPageEdit);
