import { AddIcon } from '@chakra-ui/icons';
import { Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { uploadFile } from 'API/cms';
import { updateOrganizationById } from 'API/organization';
import UploadImage from 'components/UploadImage';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { IOrganization } from 'interfaces/organization';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { getSubdomain } from 'utils/domain';
import { ReactComponent as EditIcon } from '../../../../assets/icons/edit-icon.svg';
import { ITheme } from '../../../../interfaces/theme';
import { Editor } from './components/Editor';
import styles from './styles.module.scss';
import CustomButton from 'pages/UserPage/components/CustomButton';

const WelcomeMessage = () => {
	const { authStore, organizationStore } = useStores();
	const { organization } = organizationStore;
	const currentTheme: ITheme = organization?.theme ?? {};
	const [value, setValue] = useState(
		organizationStore?.organization?.welcomeMessageContent ?? ''
	);
	const [image, setImage] = useState<File | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const isBasicUser =
		authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
	const isManager =
		authStore?.userDetail?.authRole === AuthRoleNameEnum.MANAGER;
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

	async function onSave(): Promise<void> {
		try {
			setIsLoading(true);
			let imageUrl = '';
			const organizationId = organizationStore.organization?.id;
			if (!organizationId) {
				throw new Error('Organization id not found');
			}
			if (image) {
				imageUrl = await uploadFile(organizationId, 'image', image);
			}
			const updatePayload: Partial<IOrganization> = {
				welcomeMessageContent: value,
			};
			if (imageUrl) {
				updatePayload.welcomeMessageImage = imageUrl;
			}
			await updateOrganizationById(organizationId, updatePayload);
			const subDomain = getSubdomain();
			organizationStore.getOrganizationBySubdomain(subDomain);
			toast.success(`Update successfully`);
			setIsEdit(false);
		} catch (error: any) {
			toast.error(`Something went wrong: ${get(error, 'message', '')}`);
		} finally {
			setIsLoading(false);
		}
	}

	function onCancel() {
		setImage(undefined);
		setIsEdit(false);
	}

	const EditButtons = ({
		isHide,
		isNew,
	}: {
		isHide: boolean;
		isNew?: boolean;
	}) => {
		return isEdit ? (
			<VStack spacing={2} display="flex" hidden={isHide} width="85px">
				<CustomButton
					width={'full'}
					content="Save"
					onClick={onSave}
					className="primary"
					isLoading={isLoading}
					background="primary500"
				/>
				<CustomButton
					width={'full'}
					content="Cancel"
					className="outline"
					onClick={onCancel}
					isLoading={isLoading}
				/>
				{/* <Button
          disabled={isLoading}
          onClick={onSave}
          color="white"
          width="full"
          fontSize="16px"
          lineHeight="24px"
          fontWeight={500}
          borderRadius="6px !important"
          backgroundColor={currentTheme?.primaryColor ?? primary500}
          _hover={{
            backgroundColor: currentTheme?.primaryColor ?? primary500,
            color: "white",
            opacity: 0.8,
          }}
          _focus={{
            backgroundColor: currentTheme?.primaryColor ?? primary500,
            color: "white",
            opacity: 1,
          }}
          _active={{
            backgroundColor: `${
              currentTheme?.primaryColor ?? primary500
            } !important`,
            opacity: 1,
          }}
        >
          Save
        </Button>
        <Button
          disabled={isLoading}
          onClick={onCancel}
          className={styles.cancelButton}
          width="full"
          fontSize="16px"
          lineHeight="24px"
          fontWeight={500}
          textColor="gray.700"
          borderRadius="6px !important"
          _hover={{ background: "gray.100" }}
        >
          Cancel
        </Button> */}
			</VStack>
		) : (
			<HStack
				padding="7px 16px !important"
				className={styles.editButton}
				borderRadius="6px !important"
				onClick={() => setIsEdit(true)}
				spacing={2}
				border="1px solid #E2E8F0"
				cursor="pointer"
				hidden={isHide}
			>
				<Stack width={4} height={4} alignItems="center" justifyContent="center">
					{isNew ? <AddIcon width={3} height={3} /> : <EditIcon />}
				</Stack>
				<Text
					fontSize="16px"
					lineHeight="24px"
					fontWeight={500}
					textColor="gray.700"
				>
					{isNew ? 'Add new' : 'Edit'}
				</Text>
			</HStack>
		);
	};

	if (isBasicUser || isManager) {
		return (
			<Stack
				className={styles.container}
				direction={{ base: 'column', lg: 'row' }}
				spacing={4}
			>
				<UploadImage
					value={organizationStore?.organization?.welcomeMessageImage}
					classNameImage={styles.displayImage}
					isEditable={false}
				/>
				<Box
					flex={1}
					width="100%" // Explicitly set width
					overflow="hidden" // Prevent content from overflowing
					dangerouslySetInnerHTML={{
						__html:
							organizationStore?.organization?.welcomeMessageContent ?? '',
					}}
				></Box>
			</Stack>
		);
	}

	return (
		<Stack
			className={styles.container}
			direction={{ base: 'column', lg: 'row' }}
			spacing={4}
		>
			<HStack
				justifyContent="space-between"
				width={{ base: 'full', lg: 'auto' }}
				alignItems="flex-start"
			>
				<UploadImage
					value={organizationStore?.organization?.welcomeMessageImage}
					classNameImage={styles.displayImage}
					isEditable={isEdit}
					file={image}
					setFile={setImage}
				/>
				<EditButtons isHide={!isMobile} />
			</HStack>
			{!isEdit ? (
				organizationStore?.organization?.welcomeMessageContent ? (
					<Box
						flex={1}
						width="100%" // Explicitly set width
						overflow="hidden" // Prevent content from overflowing
						dangerouslySetInnerHTML={{
							__html:
								organizationStore?.organization?.welcomeMessageContent ?? '',
						}}
					></Box>
				) : (
					<VStack
						justifyContent="center"
						spacing={4}
						width="full"
						height="144px"
					>
						<Text
							fontSize="16px"
							fontWeight={500}
							lineHeight={6}
							color="gray.700"
						>
							No company message.
						</Text>
						<EditButtons isHide={isBasicUser} isNew />
					</VStack>
				)
			) : (
				<Editor value={value} setValue={throttle(setValue, 2000)} />
			)}
			<EditButtons
				isHide={
					isMobile ||
					(!organizationStore?.organization?.welcomeMessageContent && !isEdit)
				}
			/>
		</Stack>
	);
};

export default observer(WelcomeMessage);
