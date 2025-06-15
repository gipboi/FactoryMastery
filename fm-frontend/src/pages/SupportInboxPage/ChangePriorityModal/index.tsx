import {
	Button,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useStores } from 'hooks/useStores';
import { ITheme } from 'interfaces/theme';
import { observer } from 'mobx-react';
import { useState } from 'react';

interface IChangePriorityModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: () => void;
}

const ChangePriorityModal = (props: IChangePriorityModalProps) => {
	const { isOpen, onClose, onSubmit } = props;
	const { authStore, organizationStore } = useStores();
	const { userDetail } = authStore;
	const { organization } = organizationStore;
	const currentTheme: ITheme = organization?.theme ?? {};
	const organizationId: string = userDetail?.organizationId ?? '';
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleSubmit(): Promise<void> {
		setIsLoading(true);
		await onSubmit();
		setIsLoading(false);
		onClose();
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent borderRadius={8}>
				<ModalHeader fontWeight={500} lineHeight={7} color="gray.800">
					Change priority?
				</ModalHeader>
				<ModalCloseButton
					background="white"
					border="none"
					boxShadow="none !important"
				/>
				<ModalBody paddingX={6} paddingY={2}>
					<Text>
						This action will send a notification to all users related to this
						thread. Do you want to proceed with the update?
					</Text>
				</ModalBody>
				<ModalFooter>
					<HStack width="full" justify="flex-end">
						<HStack spacing={4}>
							<Button
								variant="outline"
								color="gray.700"
								background="white"
								fontWeight={500}
								lineHeight={6}
								onClick={onClose}
								isLoading={isLoading}
							>
								Cancel
							</Button>
							<Button
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
								isLoading={isLoading}
								onClick={handleSubmit}
							>
								Confirm
							</Button>
						</HStack>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default observer(ChangePriorityModal);
