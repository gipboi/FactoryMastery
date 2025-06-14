import { CheckIcon, Search2Icon } from '@chakra-ui/icons';
import {
	Button,
	HStack,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	Stack,
} from '@chakra-ui/react';
import Dropdown from 'components/Dropdown';
import SvgIcon from 'components/SvgIcon';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { primary700 } from 'themes/globalStyles';
import { IDropdown } from 'types/common';
import { checkValidArray } from 'utils/common';
import { getSortByOptions } from '../constants';
import FilterModal from '../FilterModal';
import NewCommentModal from '../NewCommentModal';
import PrioritySelector from 'components/PrioritySelector';
import { IPriority } from 'components/PrioritySelector/constants';

interface IInboxHeaderProps {
	fetchThreadList: (showLoading?: boolean) => void;
}

const InboxHeader = (props: IInboxHeaderProps) => {
	const { fetchThreadList } = props;
	const { authStore, messageStore, organizationStore } = useStores();
	const { userDetail } = authStore;
	const { organization } = organizationStore;
	const {
		sort,
		supportMessageKeyword,
		isUnclaimed,
		isClaimedByMe,
		isClaimedByOthers,
		isResolved,
		includeParticipants,
		isDraft,
		isPublished,
		modifiedDate,
		priority,
	} = messageStore;
	const currentTheme = organization?.theme ?? {};
	const isMessageFullAccess = userDetail?.isMessageFullAccess;
	const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
	const sortByOptions = getSortByOptions(isBasicUser && !isMessageFullAccess);
	const [isOpenFilterModal, setIsOpenFilterModal] = useState<boolean>(false);
	const [isOpenNewCommentModal, setIsOpenNewCommentModal] =
		useState<boolean>(false);
	const [selectedPriority, setSelectedPriority] = useState<IPriority | null>(
		null
	);
	const debounceSearch = debounce(handleSearch, 500);
	const currentSortBy = sortByOptions.find((option) => option?.value === sort);

	const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);

	function handleSearch(keyword: string): void {
		messageStore.updateSupportMessageKeyword(keyword);
	}

	function countFilter(): number {
		let count = 0;
		if (isUnclaimed) count++;
		if (isClaimedByMe) count++;
		if (isClaimedByOthers) count++;
		if (isResolved) count++;
		if (checkValidArray(includeParticipants)) count++;
		if (isDraft) count++;
		if (isPublished) count++;
		if (priority) count++;
		if (checkValidArray(modifiedDate)) count++;

		return count;
	}

	useEffect(() => {
		if (userDetail?.id) {
			fetchThreadList();
			messageStore.getTotalSupportMessageThreads(organization?.id ?? '');
		}
	}, [
		userDetail?.id,
		sort,
		supportMessageKeyword,
		isUnclaimed,
		isClaimedByMe,
		isClaimedByOthers,
		isResolved,
		priority,
	]);

	return (
		<HStack
			width="full"
			justify="space-between"
			paddingY={4}
			borderTop="2px solid #E2E8F0"
		>
			<HStack
				width="full"
				spacing={4}
				flexDirection={isTablet ? 'row-reverse' : 'row'}
				justifyContent={isTablet ? 'space-between' : 'flex-start'}
				flexWrap="wrap"
				gap={4}
			>
				{!isTablet && (
					<InputGroup
						size="sm"
						borderRadius="6"
						background="white"
						width="auto"
						margin="0 !important"
					>
						<InputLeftElement pointerEvents="none" borderRadius="6">
							<Search2Icon color="gray.400" mt={2} />
						</InputLeftElement>
						<Input
							width="270px"
							height={10}
							type="search"
							borderRadius="6"
							placeholder="Search by step/subject"
							onChange={(event) => debounceSearch(event.currentTarget.value)}
						/>
					</InputGroup>
				)}
				<HStack
					width={isTablet ? 'full' : 'auto'}
					margin="0 !important"
					justifyContent={isTablet ? 'space-between' : 'flex-start'}
				>
					{(!isBasicUser || isMessageFullAccess) && !isTablet && (
						<HStack>
							<Button
								height={10}
								gap={2}
								size="sm"
								color="gray.700"
								fontWeight={500}
								lineHeight={5}
								borderRadius={8}
								border={`1px solid ${isUnclaimed ? primary700 : '#E2E8F0'}`}
								background={isUnclaimed ? primary700 : 'white'}
								textColor={isUnclaimed ? 'white' : 'black'}
								_hover={{
									background: currentTheme?.primaryColor ?? 'primary.700',
									opacity: currentTheme?.primaryColor ? 0.8 : 1,
									textColor: currentTheme?.primaryColor ?? 'white',
								}}
								onClick={() => messageStore.setIsUnclaimed(!isUnclaimed)}
							>
								Unclaimed
								{isUnclaimed && <CheckIcon boxSize={2} />}
							</Button>
							<Button
								height={10}
								gap={2}
								size="sm"
								color="gray.700"
								fontWeight={500}
								lineHeight={5}
								borderRadius={8}
								border={`1px solid ${isClaimedByMe ? primary700 : '#E2E8F0'}`}
								background={isClaimedByMe ? primary700 : 'white'}
								textColor={isClaimedByMe ? 'white' : 'black'}
								_hover={{
									background: currentTheme?.primaryColor ?? 'primary.700',
									opacity: currentTheme?.primaryColor ? 0.8 : 1,
									textColor: currentTheme?.primaryColor ?? 'white',
								}}
								onClick={() => messageStore.setIsClaimedByMe(!isClaimedByMe)}
							>
								Claimed by me
								{isClaimedByMe && <CheckIcon boxSize={2} />}
							</Button>
							<Button
								height={10}
								gap={2}
								size="sm"
								color="gray.700"
								fontWeight={500}
								lineHeight={5}
								borderRadius={8}
								border={`1px solid ${
									isClaimedByOthers ? primary700 : '#E2E8F0'
								}`}
								background={isClaimedByOthers ? primary700 : 'white'}
								textColor={isClaimedByOthers ? 'white' : 'black'}
								_hover={{
									background: currentTheme?.primaryColor ?? 'primary.700',
									opacity: currentTheme?.primaryColor ? 0.8 : 1,
									textColor: currentTheme?.primaryColor ?? 'white',
								}}
								onClick={() =>
									messageStore.setIsClaimedByOthers(!isClaimedByOthers)
								}
							>
								Claimed by others
								{isClaimedByOthers && <CheckIcon boxSize={2} />}
							</Button>
							<Button
								height={10}
								gap={2}
								size="sm"
								color="gray.700"
								fontWeight={500}
								lineHeight={5}
								borderRadius={8}
								border={`1px solid ${isResolved ? primary700 : '#E2E8F0'}`}
								background={isResolved ? primary700 : 'white'}
								textColor={isResolved ? 'white' : 'black'}
								_hover={{
									background: currentTheme?.primaryColor ?? 'primary.700',
									opacity: currentTheme?.primaryColor ? 0.8 : 1,
									textColor: currentTheme?.primaryColor ?? 'white',
								}}
								onClick={() => messageStore.setIsResolved(!isResolved)}
							>
								Resolved
								{isResolved && <CheckIcon boxSize={2} />}
							</Button>
							<Stack width={36}>
								<PrioritySelector
									disableLabel={true}
									selectedPriority={priority}
									setSelectedPriority={(priority: IPriority | null) =>
										messageStore.setPriority(priority)
									}
								/>
							</Stack>
						</HStack>
					)}
					<Button
						height={10}
						size="sm"
						color="gray.700"
						background="white"
						fontWeight={500}
						lineHeight={5}
						borderRadius={8}
						border="1px solid #E2E8F0"
						leftIcon={<SvgIcon iconName="sort" size={14} />}
						_hover={{ background: '#E2E8F0' }}
						onClick={() => setIsOpenFilterModal(true)}
					>
						{isTablet ? `(${countFilter()})` : 'Filter'}
					</Button>
					{isTablet && (
						<Dropdown
							name="sort"
							width="160px"
							height="32px"
							fontSize="14px"
							options={sortByOptions}
							item={currentSortBy}
							setValue={(name, dropdown: IDropdown) =>
								messageStore.changeSortBy(`${dropdown?.value}`)
							}
						/>
					)}
				</HStack>
			</HStack>
			{!isTablet && (
				<HStack>
					<Dropdown
						height={10}
						name="sort"
						width="160px"
						fontSize="14px"
						options={sortByOptions}
						item={currentSortBy}
						setValue={(name, dropdown: IDropdown) =>
							messageStore.changeSortBy(`${dropdown?.value}`)
						}
					/>
					{!(isBasicUser && !isMessageFullAccess) && (
						<Button
							height={10}
							size="sm"
							border="none"
							borderRadius="6"
							variant="outline"
							paddingX={3}
							color="white"
							fontWeight={500}
							background={currentTheme?.primaryColor ?? 'primary.500'}
							_hover={{
								background: currentTheme?.primaryColor ?? 'primary.700',
								opacity: currentTheme?.primaryColor ? 0.8 : 1,
							}}
							_active={{
								background: currentTheme?.primaryColor ?? 'primary.700',
								opacity: currentTheme?.primaryColor ? 0.8 : 1,
							}}
							leftIcon={<SvgIcon iconName="ic_outline-add" size={16} />}
							onClick={() => setIsOpenNewCommentModal(true)}
						>
							New message
						</Button>
					)}
				</HStack>
			)}
			{isTablet && (
				<IconButton
					height={10}
					size="sm"
					border="none"
					borderRadius="6"
					variant="outline"
					aria-label="Add comment"
					_hover={{ opacity: 0.8 }}
					icon={<SvgIcon iconName="ic_outline-add" size={16} />}
					background={currentTheme?.primaryColor ?? 'primary.500'}
					onClick={() => setIsOpenNewCommentModal(true)}
					position={isTablet ? 'absolute' : 'static'}
					right={0}
					top={isTablet ? '20px' : '0'}
				/>
			)}
			<NewCommentModal
				isOpen={isOpenNewCommentModal}
				onClose={() => setIsOpenNewCommentModal(false)}
				fetchThreadList={fetchThreadList}
			/>
			<FilterModal
				isOpen={isOpenFilterModal}
				onClose={() => setIsOpenFilterModal(false)}
				fetchThreadList={fetchThreadList}
			/>
		</HStack>
	);
};

export default observer(InboxHeader);
