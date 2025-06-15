import { ChevronDownIcon } from '@chakra-ui/icons';
import {
	Box,
	Text,
	Icon,
	useDisclosure,
	useOutsideClick,
	Portal,
	VStack,
} from '@chakra-ui/react';
import { IPriority, priorities } from 'components/PrioritySelector/constants';
import { useRef, useState } from 'react';

const EditablePriorityBox = ({
	priority,
	size = 'md',
	variant = 'solid',
	onPriorityChange,
	isEditable = true,
}: {
	priority: IPriority | null;
	size?: string;
	variant?: string;
	onPriorityChange: (priority: IPriority | null) => void;
	isEditable: boolean;
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const { isOpen, onOpen, onClose } = useDisclosure();
	const boxRef = useRef(null);
	const dropdownRef = useRef(null);

	useOutsideClick({
		ref: dropdownRef,
		handler: onClose,
	});

	const sizeConfig = {
		sm: {
			px: 2,
			py: 1,
			fontSize: 'xs',
			iconSize: 3,
		},
		md: {
			px: 3,
			py: 1.5,
			fontSize: 'sm',
			iconSize: 4,
		},
		lg: {
			px: 4,
			py: 2,
			fontSize: 'md',
			iconSize: 5,
		},
	};

	const sizing = sizeConfig[size as keyof typeof sizeConfig] ?? {};
	const IconComponent = priority?.icon;

	const handleMouseEnter = () => {
		if (isEditable) {
			setIsHovered(true);
		}
	};

	const handleMouseLeave = () => {
		if (!isOpen) {
			setIsHovered(false);
		}
	};

	const handleClick = () => {
		if (!isEditable) return;

		if (boxRef.current) {
			const rect = (boxRef?.current as any)?.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom + window.scrollY + 4,
				left: rect.left + window.scrollX,
			});
		}
		onOpen();
		setIsHovered(true);
	};

	const handlePrioritySelect = (newPriority: IPriority | null) => {
		onPriorityChange?.(newPriority);
		onClose();
		setIsHovered(false);
	};

	const baseBoxProps = {
		ref: boxRef,
		display: 'inline-flex',
		alignItems: 'center',
		gap: 1.5,
		px: sizing.px,
		py: sizing.py,
		borderRadius: 'md',
		fontSize: sizing.fontSize,
		fontWeight: 'medium',
		position: 'relative',
		transition: 'all 0.2s ease',
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
		onClick: handleClick,
		cursor: isEditable ? 'pointer' : 'default',
	};

	const renderPriorityContent = () => (
		<>
			{IconComponent && <Icon as={IconComponent} boxSize={sizing.iconSize} />}
			<Text>{priority?.label}</Text>
			{isEditable && (isHovered || isOpen) && (
				<Icon
					as={ChevronDownIcon}
					boxSize={3}
					ml={1}
					transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
					transition="transform 0.2s ease"
				/>
			)}
		</>
	);

	const solidBoxProps = {
		...baseBoxProps,
		bg: priority?.color,
		color: 'white',
		_hover: isEditable
			? {
					transform: 'scale(1.02)',
					boxShadow: 'md',
			  }
			: {},
		boxShadow: (isHovered || isOpen) && isEditable ? 'md' : 'none',
	};

	const outlineBoxProps = {
		...baseBoxProps,
		color: priority?.color,
		border: '1px solid',
		borderColor: priority?.color,
		bg: 'white',
		_hover: isEditable
			? {
					bg: `${priority?.color}10`,
					transform: 'scale(1.02)',
					boxShadow: 'md',
			  }
			: {},
		boxShadow: (isHovered || isOpen) && isEditable ? 'md' : 'none',
	};

	return (
		<>
			{variant === 'solid' ? (
				<Box
					ref={boxRef}
					display="inline-flex"
					alignItems="center"
					gap={1.5}
					px={sizing.px}
					py={sizing.py}
					bg={priority?.color}
					color="white"
					borderRadius="md"
					fontSize={sizing.fontSize}
					fontWeight="medium"
					position="relative"
					transition="all 0.2s ease"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
					cursor={isEditable ? 'pointer' : 'default'}
					_hover={
						isEditable
							? {
									transform: 'scale(1.02)',
									boxShadow: 'md',
							  }
							: {}
					}
					boxShadow={(isHovered || isOpen) && isEditable ? 'md' : 'none'}
				>
					{renderPriorityContent()}
				</Box>
			) : (
				<Box
					ref={boxRef}
					display="inline-flex"
					alignItems="center"
					gap={1.5}
					px={sizing.px}
					py={sizing.py}
					color={priority?.color}
					border="1px solid"
					borderColor={priority?.color}
					bg="white"
					borderRadius="md"
					fontSize={sizing.fontSize}
					fontWeight="medium"
					position="relative"
					transition="all 0.2s ease"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
					cursor={isEditable ? 'pointer' : 'default'}
					_hover={
						isEditable
							? {
									bg: `${priority?.color}10`,
									transform: 'scale(1.02)',
									boxShadow: 'md',
							  }
							: {}
					}
					boxShadow={(isHovered || isOpen) && isEditable ? 'md' : 'none'}
				>
					{renderPriorityContent()}
				</Box>
			)}

			{isOpen && (
				<Portal>
					<Box
						ref={dropdownRef}
						position="absolute"
						top={`${dropdownPosition.top}px`}
						left={`${dropdownPosition.left}px`}
						zIndex={1000}
						bg="white"
						border="1px solid"
						borderColor="gray.200"
						borderRadius="md"
						boxShadow="lg"
						py={2}
						minW="150px"
						animation="fadeIn 0.15s ease-out"
					>
						<VStack spacing={0} align="stretch">
							{priorities.map((priorityOption) => {
								const OptionIcon = priorityOption.icon;
								const isSelected = priority?.id === priorityOption.id;

								return (
									<Box
										key={priorityOption.id || 'none'}
										display="flex"
										alignItems="center"
										gap={2}
										px={3}
										py={2}
										cursor="pointer"
										bg={isSelected ? 'gray.50' : 'transparent'}
										color={priorityOption.color}
										_hover={{
											bg: 'gray.50',
										}}
										onClick={() =>
											handlePrioritySelect(
												priorityOption.id ? priorityOption : null
											)
										}
										fontSize="sm"
									>
										<Icon as={OptionIcon} boxSize={4} />
										<Text fontWeight={isSelected ? 'semibold' : 'normal'}>
											{priorityOption.label}
										</Text>
										{isSelected && (
											<Box
												ml="auto"
												w={2}
												h={2}
												bg={priorityOption.color}
												borderRadius="full"
											/>
										)}
									</Box>
								);
							})}
						</VStack>
					</Box>
				</Portal>
			)}

			<style>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-4px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</>
	);
};

export default EditablePriorityBox;