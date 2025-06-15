/* eslint-disable max-lines */
import { CheckIcon, Search2Icon } from '@chakra-ui/icons';
import {
	Button,
	Checkbox,
	FormControl,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	InputLeftElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Text,
	VStack,
} from '@chakra-ui/react';
import { EBreakPoint } from 'constants/theme';
import { AuthRoleNameEnum } from 'constants/user';
import useBreakPoint from 'hooks/useBreakPoint';
import { useStores } from 'hooks/useStores';
import { ITheme } from 'interfaces/theme';
import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { primary700 } from 'themes/globalStyles';
import { IOption } from 'types/common';
import { getValidArray } from 'utils/common';
import FilterDropdown from '../FilterDropdown';
import CustomDateRangePickerWithMask from 'components/CustomDaterRangePickerWithMask';
import PrioritySelector from 'components/PrioritySelector';
import { IPriority } from 'components/PrioritySelector/constants';

const PICKER_DATE_FORMAT = 'MM/dd/yyyy';
const DATE_INPUT_FORMAT = '##/##/#### - ##/##/####';
const DATE_INPUT_MASK = [
	'M',
	'M',
	'D',
	'D',
	'Y',
	'Y',
	'Y',
	'Y',
	'M',
	'M',
	'D',
	'D',
	'Y',
	'Y',
	'Y',
	'Y',
];

interface IFilterForm {
	modifiedDate?: Date[];
}

interface IFilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	fetchThreadList: (showLoading?: boolean) => void;
}

const FilterModal = (props: IFilterModalProps) => {
	const { isOpen, onClose, fetchThreadList } = props;
	const { authStore, messageStore, organizationStore, userStore } = useStores();
	const { userDetail } = authStore;
	const { organization } = organizationStore;
	const {
		isDraft,
		isPublished,
		isUnclaimed,
		isClaimedByMe,
		isClaimedByOthers,
		isResolved,
		priority,
	} = messageStore;
	const currentTheme: ITheme = organization?.theme ?? {};
	const organizationId: string = userDetail?.organizationId ?? '';
	const [isSelectedDraft, setIsSelectedDraft] = useState<boolean>(false);
	const [isSelectedPublished, setIsSelectedPublished] =
		useState<boolean>(false);
	const [selectedUsers, setSelectedUsers] = useState<IOption<string>[]>([]);

	const isBasicUser = userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
	const isTablet: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.LG);
	const debounceSearch = debounce(handleSearch, 500);

	const methods = useForm<IFilterForm>();
	const { handleSubmit, reset, control, setValue } = methods;
	const modifiedDate: Date[] =
		useWatch({ control, name: 'modifiedDate' }) ?? [];

	function handleSearch(keyword: string): void {
		messageStore.updateSupportMessageKeyword(keyword);
	}

	function clearAllFilters(): void {
		setIsSelectedDraft(false);
		setIsSelectedPublished(false);
		setSelectedUsers([]);
		messageStore.setModifiedDate([]);
		messageStore.setPriority(null);
		reset({ modifiedDate: [] });
	}

	async function prefillFormData(): Promise<void> {
		setIsSelectedDraft(isDraft);
		setIsSelectedPublished(isPublished);
		reset({ modifiedDate: messageStore.modifiedDate });
	}

	async function onSubmit(): Promise<void> {
		const selectedParticipants = getValidArray(userStore.users).filter((user) =>
			selectedUsers
				.map((selectedUser) => String(selectedUser?.value))
				.includes(user?.id ?? '')
		);
		messageStore.setIncludeParticipants(selectedParticipants);
		messageStore.setIsDraft(isSelectedDraft);
		messageStore.setIsPublished(isSelectedPublished);
		messageStore.changeProcessType();
		messageStore.setModifiedDate(modifiedDate);
		onClose();
		fetchThreadList();
	}

	useEffect(() => {
		if (isOpen) {
			prefillFormData();
		}
	}, [isOpen, organizationId]);

	return (
		<Modal isCentered size="lg" isOpen={isOpen} onClose={onClose}>
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ModalOverlay />
					<ModalContent borderRadius={8}>
						<ModalHeader
							fontSize="lg"
							fontWeight={500}
							lineHeight={7}
							color="gray.800"
						>
							Filters
						</ModalHeader>
						<ModalCloseButton
							background="white"
							border="none"
							boxShadow="none !important"
						/>
						<ModalBody borderTop="1px solid #E2E8F0" padding={6}>
							<VStack width="full" align="flex-start" spacing={6}>
								<InputGroup
									size="sm"
									width="100%"
									borderRadius="6"
									background="white"
									margin="0 !important"
								>
									<InputLeftElement pointerEvents="none" borderRadius="6">
										<Search2Icon color="gray.400" />
									</InputLeftElement>
									<Input
										width="100%"
										height="32px"
										type="search"
										borderRadius="6"
										placeholder="Search by step/subject"
										onChange={(event) =>
											debounceSearch(event.currentTarget.value)
										}
									/>
								</InputGroup>
								{!isBasicUser && isTablet && (
									<>
										<HStack flexWrap="wrap" gap={2}>
											<Button
												margin="0 !important"
												gap={2}
												size="sm"
												color="gray.700"
												fontWeight={500}
												lineHeight={5}
												borderRadius={8}
												border={`1px solid ${
													isUnclaimed ? '#00A9EB' : '#E2E8F0'
												}`}
												background={isUnclaimed ? 'primary.50' : 'white'}
												_hover={{ background: 'primary.50' }}
												onClick={() =>
													messageStore.setIsUnclaimed(!isUnclaimed)
												}
											>
												Unclaimed
												{isUnclaimed && <CheckIcon boxSize={2} />}
											</Button>
											<Button
												margin="0 !important"
												gap={2}
												size="sm"
												color="gray.700"
												fontWeight={500}
												lineHeight={5}
												borderRadius={8}
												border={`1px solid ${
													isClaimedByMe ? primary700 : '#E2E8F0'
												}`}
												background={isClaimedByMe ? 'red' : 'white'}
												_hover={{ background: 'primary.50' }}
												onClick={() =>
													messageStore.setIsClaimedByMe(!isClaimedByMe)
												}
											>
												Claimed by me
												{isClaimedByMe && <CheckIcon boxSize={2} />}
											</Button>
											<Button
												margin="0 !important"
												gap={2}
												size="sm"
												color="gray.700"
												fontWeight={500}
												lineHeight={5}
												borderRadius={8}
												border={`1px solid ${
													isClaimedByOthers ? '#00A9EB' : '#E2E8F0'
												}`}
												background={isClaimedByOthers ? 'red' : 'white'}
												_hover={{ background: 'red' }}
												onClick={() =>
													messageStore.setIsClaimedByOthers(!isClaimedByOthers)
												}
											>
												Claimed by others
												{isClaimedByOthers && <CheckIcon boxSize={2} />}
											</Button>
											<Button
												margin="0 !important"
												gap={2}
												size="sm"
												color="gray.700"
												fontWeight={500}
												lineHeight={5}
												borderRadius={8}
												border={`1px solid ${
													isResolved ? '#00A9EB' : '#E2E8F0'
												}`}
												background={isResolved ? 'primary.50' : 'white'}
												_hover={{ background: 'primary.50' }}
												onClick={() => messageStore.setIsResolved(!isResolved)}
											>
												Resolved
												{isResolved && <CheckIcon boxSize={2} />}
											</Button>
										</HStack>
										<Stack width={'full'}>
											<PrioritySelector
												selectedPriority={priority}
												setSelectedPriority={(priority: IPriority | null) =>
													messageStore.setPriority(priority)
												}
											/>
										</Stack>
									</>
								)}
								<FilterDropdown
									isOpenModal={isOpen}
									name="participants"
									label="Included participants"
									placeholder="Search by full name/username"
									options={userStore.users}
									currentItems={messageStore.includeParticipants}
									selectedOptions={selectedUsers}
									setSelectedOptions={setSelectedUsers}
								/>
								<VStack width="full" align="flex-start">
									<FormControl id="modifiedDate">
										<FormLabel color="gray.700">Last modified</FormLabel>
										<Controller
											name="modifiedDate"
											control={control}
											render={(datePickerProps) => {
												return (
													<CustomDateRangePickerWithMask
														name="modifiedDate"
														dateFormat={PICKER_DATE_FORMAT}
														inputFormat={DATE_INPUT_FORMAT}
														inputMask={DATE_INPUT_MASK}
														inputPlaceholder="__/__/____ - __/__/____"
														setValue={setValue}
														{...datePickerProps}
													/>
												);
											}}
										/>
									</FormControl>
								</VStack>
							</VStack>
						</ModalBody>
						<ModalFooter>
							<HStack width="full" justify="space-between">
								<Text
									margin={0}
									color="gray.700"
									fontSize="md"
									fontWeight={500}
									lineHeight={6}
									cursor="pointer"
									onClick={clearAllFilters}
								>
									Clear Filters
								</Text>
								<HStack spacing={4}>
									<Button
										variant="outline"
										background="white"
										fontWeight={500}
										lineHeight={6}
										onClick={onClose}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="outline"
										fontWeight={500}
										lineHeight={6}
										color="white"
										background={currentTheme?.primaryColor ?? 'primary.500'}
										_hover={{
											background: currentTheme?.primaryColor ?? 'primary.700',
											opacity: currentTheme?.primaryColor ? 0.8 : 1,
										}}
										_active={{
											background: currentTheme?.primaryColor ?? 'primary.700',
											opacity: currentTheme?.primaryColor ? 0.8 : 1,
										}}
									>
										Apply
									</Button>
								</HStack>
							</HStack>
						</ModalFooter>
					</ModalContent>
				</form>
			</FormProvider>
		</Modal>
	);
};

export default observer(FilterModal);
