import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Text,
	Textarea,
} from '@chakra-ui/react';
import { useStores } from 'hooks/useStores';
import isEmpty from 'lodash/isEmpty';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { primary } from 'themes/globalStyles';
import { IOption } from 'types/common';
// import { createAudit } from 'API/audit'
// import { createSupportMessageThreads } from 'API/messages/support-message'
import { createSupportMessageThreads } from 'API/messages/support-message';
import AttachmentSection from 'components/AttachmentSection';
import SvgIcon from 'components/SvgIcon';
import { IProcessWithRelations } from 'interfaces/process';
import { ITheme } from 'interfaces/theme';
import { checkValidArray } from 'utils/common';
import { handleUploadMultiple } from 'utils/upload';
import StepDetail from '../StepDetail';
import StepFilterSelect from './components/StepFilterSelect';
import { ISupportMessageThread } from 'interfaces/message';
import { useNavigate } from 'react-router-dom';
import routes from 'routes';
import { EInboxTab } from 'pages/SupportInboxPage/constants';
import PrioritySelector from 'components/PrioritySelector';
import { IPriority } from 'components/PrioritySelector/constants';
import { PriorityEnum } from 'constants/enums/thread';
interface INewSupportMessageModalProps {
	isOpen: boolean;
	process: IProcessWithRelations;
	refetchThreadList?: () => void;
	openThread?: (thread: any) => void;
	onClose: () => void;
}

const SendSupportMessageModal = (props: INewSupportMessageModalProps) => {
	const {
		isOpen,
		refetchThreadList = () => {},
		openThread = () => {},
		onClose,
	} = props;
	const { userStore, authStore, organizationStore, messageStore } = useStores();
	const navigate = useNavigate();
	const methods = useForm();
	const { control, setValue } = methods;
	const [attachments, setAttachments] = useState<File[]>([]);
	const [processing, setProcessing] = useState<boolean>(false);
	const [messageContent, setMessageContent] = useState('');
	const stepOptions = (props.process?.steps || []).map((step) => ({
		label: step?.name ?? '',
		value: step?.id,
		icon: step?.icon,
	}));
	const { organization } = organizationStore;
	const currentTheme: ITheme = organization?.theme ?? {};
	const priority = useWatch({ name: 'priority', control });

	const [selectedStep, setSelectedStep] = useState<IOption<string> | null>(
		null
	);
	const [selectedPriority, setSelectedPriority] = useState<IPriority | null>(
		null
	);
	const fileInputRef = useRef<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const isDisableSend = (isEmpty(attachments) && !messageContent) || processing;

	const process = props.process;

	useEffect(() => {
		setSelectedStep(null);
		setMessageContent('');
		setAttachments([]);
	}, [isOpen]);

	async function onSubmit() {
		try {
			setProcessing(true);
			const { organizationId, id: currentUserId } = authStore.userDetail ?? {};
			const attachmentData = await handleUploadMultiple(
				attachments,
				userStore.currentUser?.organizationId ?? ''
			);
			const data = {
				organizationId: organizationId ?? '',
				userId: currentUserId ?? '',
				ownerId: currentUserId,
				content: messageContent,
				attachments: attachmentData,
				...(selectedPriority?.id ? { priority: selectedPriority?.id } : {}),
			};
			let createdThread: ISupportMessageThread;
			if (selectedStep) {
				createdThread = await createSupportMessageThreads({
					...data,
					stepId: selectedStep?.value ?? '',
				});
			} else {
				createdThread = await createSupportMessageThreads({
					...data,
					processId: process?.id,
				});
			}
			messageStore.setCurrentSupportThreadId(createdThread?.id);
			onClose();
			toast.success('Create new comment successfully');
		} catch (error: any) {
			const errorMessage = error.response?.data.error.message;
			toast.error(errorMessage ?? 'Fail to create new comment');
		} finally {
			setProcessing(false);
			messageStore.setIsClaimedByMe(false);
			messageStore.setIsClaimedByOthers(false);
			messageStore.setIsUnclaimed(false);
			messageStore.setIsResolved(false);
			let url = `${routes.messages.value}?tab=${EInboxTab.SUPPORT}`
			if (selectedPriority?.id === PriorityEnum.URGENT) {
				url = `${url}&priority=${selectedPriority?.id}`
			}
			navigate(url);
		}
	}

	async function handleSelectFile(evt: React.ChangeEvent<HTMLInputElement>) {
		if (evt.currentTarget.files) {
			setProcessing(true);
			const targetFiles = Array.from(evt.currentTarget.files);
			setAttachments([...attachments, ...targetFiles]);
		}
		setProcessing(false);
	}

	function handleRemoveSelectedStep() {
		setSelectedStep(null);
		setValue('step', null);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontWeight="500"
					fontSize="18px"
					lineHeight="28px"
					color="gray.800"
					borderBottom="1px solid #E2E8F0"
				>
					Leave a Thread
				</ModalHeader>
				<ModalCloseButton
					boxShadow="unset"
					border="unset"
					background="#fff"
					_focus={{ borderColor: 'unset' }}
					_active={{ background: '#fff', borderColor: 'unset' }}
				/>
				<ModalBody paddingTop="24px" paddingBottom="27px">
					<FormProvider {...methods}>
						<form>
							<StepDetail
								collections={process?.collections}
								process={process}
							/>
							<Stack marginTop={4}>
								<PrioritySelector
									selectedPriority={selectedPriority}
									setSelectedPriority={setSelectedPriority}
								/>
							</Stack>
							<Stack>
								<StepFilterSelect
									name="step"
									placeholder="Search step by number or name"
									label="Select step to leave comment (optional)"
									value={selectedStep}
									control={control}
									defaultOptions={[]}
									options={stepOptions}
									removeStep={handleRemoveSelectedStep}
									onChange={(event: any) => {
										if (selectedStep?.value === event?.value) {
											setSelectedStep(null);
										} else {
											setSelectedStep(event);
										}
									}}
								/>
							</Stack>
							<Text
								fontWeight="500"
								fontSize="16px"
								lineHeight="24px"
								color="gray.700"
								marginTop="24px"
								marginBottom="8px"
							>
								Comment
							</Text>
							<Textarea
								placeholder="Enter your comment"
								onChange={(event) =>
									setMessageContent(event?.target?.value ?? '')
								}
								_focus={{ borderColor: currentTheme?.primaryColor ?? primary }}
							/>

							<Button
								leftIcon={
									<SvgIcon size={13} iconName="ic_baseline-attach-file" />
								}
								variant="outline"
								background="white"
								border="1px solid #E2E8F0"
								borderRadius="6px"
								color="gray.700"
								fontWeight={500}
								fontSize="16px"
								lineHeight="24px"
								margin="24px 0 "
								_hover={{ background: 'whiteAlpha.700' }}
								_active={{ background: 'whiteAlpha.700' }}
								onClick={() => {
									if (!processing) {
										fileInputRef.current.value = null;
										fileInputRef.current?.click();
									}
								}}
							>
								Attach file
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleSelectFile}
									style={{ display: 'none' }}
									multiple
								/>
							</Button>

							{checkValidArray(attachments) && (
								<AttachmentSection
									attachments={attachments}
									setAttachments={setAttachments}
									fileInputRef={fileInputRef}
									isLoading={isLoading}
								/>
							)}
						</form>
					</FormProvider>
				</ModalBody>

				<ModalFooter borderTop="1px solid #E2E8F0">
					<Button
						variant="outline"
						background="white"
						border="1px solid #E2E8F0"
						borderRadius="6px"
						color="gray.700"
						fontWeight={500}
						fontSize="16px"
						lineHeight="24px"
						_hover={{ background: 'whiteAlpha.700' }}
						_active={{ background: 'whiteAlpha.700' }}
						onClick={onClose}
						marginRight="16px"
						isLoading={processing}
					>
						Cancel
					</Button>
					<Button
						variant="outline"
						borderRadius="6px"
						color="white"
						fontWeight={500}
						fontSize="16px"
						lineHeight="24px"
						background={currentTheme?.primaryColor ?? 'primary.500'}
						_hover={{
							background: currentTheme?.primaryColor ?? 'primary.700',
							opacity: currentTheme?.primaryColor ? 0.8 : 1,
						}}
						_active={{
							background: currentTheme?.primaryColor ?? 'primary.700',
							opacity: currentTheme?.primaryColor ? 0.8 : 1,
						}}
						_focus={{
							background: currentTheme?.primaryColor ?? 'primary.700',
							opacity: currentTheme?.primaryColor ? 0.8 : 1,
						}}
						onClick={onSubmit}
						disabled={isDisableSend}
						isLoading={processing}
					>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default observer(SendSupportMessageModal);
