import React, { useState } from 'react';
import {
	VStack,
	HStack,
	Text,
	Input,
	Box,
	Icon,
	InputGroup,
	InputLeftElement,
	FormControl,
	FormLabel,
	Tooltip,
} from '@chakra-ui/react';
import { FiFlag, FiHelpCircle } from 'react-icons/fi';
import { GrClear } from 'react-icons/gr';
import { PriorityEnum } from 'constants/enums/thread';
import { IPriority, priorities } from './constants';

const PrioritySelector = ({
	selectedPriority,
	setSelectedPriority,
	disableLabel = false,
	selectable = false,
}: {
	selectedPriority: IPriority | null;
	setSelectedPriority:
		| React.Dispatch<React.SetStateAction<IPriority | null>>
		| ((priority: IPriority | null) => void);
	disableLabel?: boolean;
	selectable?: boolean;
}) => {
	const [searchValue, setSearchValue] = useState('');
	const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

	const handlePrioritySelect = (priority: IPriority) => {
		setSelectedPriority(priority);
		setSearchValue(priority.label);
		setShowPriorityDropdown(false);
	};

	const handleClear = () => {
		setSelectedPriority(null);
		setSearchValue('');
		setShowPriorityDropdown(false);
	};

	return (
		<FormControl>
			{!disableLabel && (
				<HStack spacing={2} mb={2}>
					<FormLabel fontSize="md" color="gray.600" mb={0} mr={0}>
						Priority
					</FormLabel>
					<Tooltip
						label="Set priority flag for thread"
						fontSize="14px"
						padding={2}
						shouldWrapChildren
						background="gray.700"
						placement="top"
						color="white"
						hasArrow
						borderRadius="4px"
					>
						<Icon as={FiHelpCircle} boxSize={4} color="gray.400" />
					</Tooltip>
				</HStack>
			)}

			<Box position="relative">
				<InputGroup>
					<InputLeftElement pointerEvents="none">
						{selectedPriority ? (
							<Icon
								as={selectedPriority.icon}
								color={selectedPriority.color}
								fill={selectedPriority.color}
								boxSize={4}
							/>
						) : (
							<Icon as={FiFlag} color="gray.400" />
						)}
					</InputLeftElement>
					<Input
						placeholder="Priority"
						value={selectedPriority ? selectedPriority?.label : searchValue}
						onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
						bg="white"
						readOnly
						{...(!selectable ? {
							border: "1px",
							borderColor: "gray.200",
							_hover: { borderColor: 'gray.300' },
							_focus: { borderColor: 'blue.400', bg: 'white' },
							cursor: "pointer"
						} : {})}
					/>
				</InputGroup>

				{showPriorityDropdown && (
					<Box
						position="absolute"
						top="100%"
						left="0"
						right="0"
						zIndex="dropdown"
						bg="white"
						border="1px"
						borderColor="gray.200"
						borderRadius="md"
						mt={1}
						shadow="lg"
						maxH="250px"
						overflowY="auto"
					>
						<VStack spacing={0} align="stretch" p={1}>
							{priorities.map((priority) => (
								<HStack
									key={priority.id}
									p={2}
									cursor="pointer"
									borderRadius="md"
									_hover={{ bg: 'gray.50' }}
									onClick={() => handlePrioritySelect(priority)}
									justify="space-between"
								>
									<HStack spacing={3}>
										<Icon
											as={priority.icon}
											color={priority.color}
											fill={priority.color}
											boxSize={4}
										/>
										<Text fontSize="md" color="gray.700">
											{priority.label}
										</Text>
									</HStack>
								</HStack>
							))}

							<HStack
								p={2}
								cursor="pointer"
								borderRadius="md"
								_hover={{ bg: 'gray.50' }}
								onClick={handleClear}
								justify="space-between"
							>
								<HStack spacing={3}>
									<Icon as={GrClear} color="gray.400" boxSize={4} />
									<Text fontSize="md" color="gray.700">
										Clear
									</Text>
								</HStack>
							</HStack>
						</VStack>
					</Box>
				)}
			</Box>
		</FormControl>
	);
};

export default PrioritySelector;
