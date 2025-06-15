import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Button,
	VStack,
	HStack,
	Text,
	Box,
	Badge,
	Avatar,
	Link,
	SimpleGrid,
	IconButton,
} from '@chakra-ui/react';
import { PhoneIcon, EmailIcon, WarningIcon } from '@chakra-ui/icons';
import { getPriorityConfig } from 'utils/common';
import { PriorityEnum } from 'constants/enums/thread';
import { primary500 } from 'themes/globalStyles';
import { AuthRoleNameEnum } from 'constants/user';
import { useEffect } from 'react';
import { useStores } from 'hooks/useStores';
import { IUser } from 'interfaces/user';
import { getName } from 'utils/user';

const EmergencyContactModal = ({
	isOpen,
	onOpen,
	onClose,
}: {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}) => {
	const { organizationStore, userStore } = useStores();
	const { organization } = organizationStore;
	const { emergencyContacts } = userStore;

	useEffect(() => {
		userStore.getAllEmergencyContacts(organization?.id ?? '');
	}, []);

	const ContactCard = ({ contact }: { contact: Partial<IUser> }) => (
		<Box
			bg="white"
			borderRadius="12px"
			p={5}
			border="1px solid"
			borderColor="#E2E8F0"
			position="relative"
			_hover={{
				borderColor: '#3182CE',
				shadow: '0 4px 20px rgba(0,0,0,0.08)',
				transform: 'translateY(-1px)',
				transition: 'all 0.2s ease',
			}}
		>
			<Box
				position="absolute"
				top={3}
				right={3}
				w={3}
				h={3}
				borderRadius="full"
			/>

			<HStack spacing={4} mb={4}>
				<Avatar
					name={getName(contact)}
					size="lg"
					color="white"
					fontWeight="600"
				/>
				<Box flex={1}>
					<Text fontSize="lg" fontWeight="600" color="#1A202C" mb={1}>
						{getName(contact)}
					</Text>
					<Text fontSize="sm" color="#4A5568" mb={1}>
						{contact?.authRole}
					</Text>
				</Box>
			</HStack>

			<VStack spacing={3} align="stretch">
				<HStack justify="space-between">
					<HStack spacing={3}>
						<IconButton
							size="sm"
							aria-label="Call"
							icon={<PhoneIcon />}
							bg={primary500}
							color="white"
							borderRadius="8px"
							_hover={{ bg: '#2C5282' }}
							onClick={() =>
								window.open(`tel:${contact?.mobilePhone ?? contact?.workPhone}`)
							}
						/>
						<Link
							href={`tel:${contact?.mobilePhone ?? contact?.workPhone}`}
							fontSize="sm"
							fontWeight="500"
							color={primary500}
							_hover={{ textDecoration: 'none', color: '#2C5282' }}
						>
							{contact?.mobilePhone ?? contact?.workPhone}
						</Link>
					</HStack>
				</HStack>

				<HStack justify="space-between">
					<HStack spacing={3}>
						<IconButton
							size="sm"
							aria-label="Email"
							icon={<EmailIcon />}
							bg={primary500}
							color="white"
							borderRadius="8px"
							_hover={{ bg: '#2C5282' }}
							onClick={() => window.open(`mailto:${contact?.email}`)}
						/>
						<Link
							href={`mailto:${contact?.email}`}
							fontSize="sm"
							fontWeight="500"
							color={primary500}
							_hover={{ textDecoration: 'none', color: '#2C5282' }}
							noOfLines={1}
						>
							{contact?.email}
						</Link>
					</HStack>
				</HStack>
			</VStack>

			<HStack
				justify="space-between"
				mt={4}
				pt={3}
				borderTop="1px solid #F1F5F9"
			>
				<Badge
					px={3}
					py={1}
					borderRadius="full"
					fontSize="xs"
					fontWeight="500"
					bg={
						contact?.authRole === AuthRoleNameEnum.ORG_ADMIN
							? '#FED7D7'
							: contact?.authRole === AuthRoleNameEnum.MANAGER
							? '#FED7AA'
							: '#F7FAFC'
					}
					color={
						getPriorityConfig(
							contact?.authRole === AuthRoleNameEnum.ORG_ADMIN
								? PriorityEnum.URGENT
								: PriorityEnum.HIGH
						)?.color
					}
				>
					{contact?.authRole === AuthRoleNameEnum.ORG_ADMIN
						? PriorityEnum.URGENT
						: PriorityEnum.HIGH}
				</Badge>
				<Badge
					px={3}
					py={1}
					borderRadius="full"
					fontSize="xs"
					fontWeight="500"
					bg="#C6F6D5"
					color="#22543D"
				>
					● Available
				</Badge>
			</HStack>
		</Box>
	);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="3xl">
			<ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
			<ModalContent
				maxW="800px"
				borderRadius="16px"
				overflow="hidden"
				boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
				bg="white"
			>
				<ModalHeader
					bg="linear-gradient(135deg, #E53E3E 0%, #C53030 100%)"
					color="white"
					py={6}
					px={8}
					position="relative"
				>
					<HStack spacing={3}>
						<Box
							p={4}
							bg="rgba(255, 255, 255, 0.2)"
							borderRadius="12px"
							backdropFilter="blur(10px)"
						>
							<WarningIcon boxSize={6} />
						</Box>
						<VStack align="start" spacing={1}>
							<Text fontSize="xl" fontWeight="700">
								Emergency Contacts
							</Text>
							<Text fontSize="sm" opacity={0.9} fontWeight="400">
								Immediate assistance from organization admins and managers
							</Text>
						</VStack>
					</HStack>
				</ModalHeader>
				<ModalCloseButton
					color="white"
					size="lg"
					bg="rgba(255, 255, 255, 0.2)"
					borderRadius="8px"
					_hover={{ bg: 'rgba(255, 255, 255, 0.3)' }}
					border="none"
					boxShadow="none !important"
				/>

				<ModalBody p={8} bg="#FAFAFA">
					<VStack spacing={6} align="stretch">
						<Box
							bg="linear-gradient(135deg, #FFF5B7 0%, #FED7AA 100%)"
							p={4}
							borderRadius="12px"
							border="1px solid #F6AD55"
							position="relative"
						>
							<HStack spacing={3}>
								<Box p={2} bg="rgba(237, 137, 54, 0.2)" borderRadius="8px">
									<WarningIcon color="#C05621" boxSize={5} />
								</Box>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" fontWeight="600" color="#744210">
										For life-threatening emergencies, call 911 immediately
									</Text>
									<Text fontSize="xs" color="#744210" opacity={0.8}>
										Then contact the appropriate emergency contact below
									</Text>
								</VStack>
							</HStack>
						</Box>

						{/* Contact Grid */}
						<SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
							{emergencyContacts.map((contact) => (
								<ContactCard key={contact?.id} contact={contact} />
							))}
						</SimpleGrid>

						{/* Quick Info */}
						<Box
							bg="white"
							p={5}
							borderRadius="12px"
							border="1px solid #E2E8F0"
						>
							<Text fontSize="sm" fontWeight="600" color="#2D3748" mb={3}>
								Quick Actions Available:
							</Text>
							<VStack align="start" spacing={2}>
								<HStack spacing={2}>
									<Box w={2} h={2} bg={primary500} borderRadius="full" />
									<Text fontSize="sm" color="#4A5568">
										Click phone numbers or use call buttons to dial directly
									</Text>
								</HStack>
								<HStack spacing={2}>
									<Box w={2} h={2} bg={primary500} borderRadius="full" />
									<Text fontSize="sm" color="#4A5568">
										Click email addresses or use email buttons to compose
										message
									</Text>
								</HStack>
								<HStack spacing={2}>
									<Box w={2} h={2} bg="#E53E3E" borderRadius="full" />
									<Text fontSize="sm" color="#4A5568">
										Red priority indicator = Urgent contact
									</Text>
								</HStack>
							</VStack>
						</Box>
					</VStack>
				</ModalBody>

				<ModalFooter bg="white" py={4} px={8} borderTop="1px solid #F1F5F9">
					<Button
						onClick={onClose}
						bg="#F7FAFC"
						color="#4A5568"
						border="1px solid #E2E8F0"
						_hover={{ bg: '#EDF2F7', borderColor: '#CBD5E0' }}
						borderRadius="8px"
						fontWeight="500"
						px={6}
					>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default EmergencyContactModal;
