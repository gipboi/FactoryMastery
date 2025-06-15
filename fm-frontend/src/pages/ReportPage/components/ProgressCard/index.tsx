import React from 'react';
import { IconType } from 'react-icons';
import {
	Box,
	Card,
	CardBody,
	Text,
	HStack,
	VStack,
	Progress,
	Icon,
	useColorModeValue,
} from '@chakra-ui/react';

interface ProgressCardProps {
	title: string;
	current: number;
	total: number;
	color: string;
	icon: IconType;
}
const ProgressCard: React.FC<ProgressCardProps> = ({
	title,
	current,
	total,
	color,
	icon,
}) => {
	const percentage = (current / total) * 100;
	const bgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.100', 'gray.600');
	const shadowColor = useColorModeValue(
		'0px 1px 3px rgba(0, 0, 0, 0.1)',
		'0px 1px 3px rgba(0, 0, 0, 0.3)'
	);

	return (
		<Card
			bg={bgColor}
			borderColor={borderColor}
			borderWidth="1px"
			boxShadow={shadowColor}
			_hover={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)' }}
			transition="all 0.2s"
		>
			<CardBody p={5}>
				<VStack align="flex-start" spacing={4}>
					<HStack spacing={2}>
						<Box p={2} borderRadius="lg" bg={`${color}.500`}>
							<Icon as={icon} color="white" boxSize="16px" />
						</Box>
						<Text fontSize="sm" color="gray.500" fontWeight="medium">
							{title}
						</Text>
					</HStack>

					<VStack align="flex-start" spacing={3} w="full">
						<HStack justify="space-between" w="full">
							<Text fontSize="lg" fontWeight="bold" color="gray.900">
								{current} / {total}
							</Text>
							<Text fontSize="sm" color="gray.500" fontWeight="medium">
								{percentage.toFixed(1)}%
							</Text>
						</HStack>
						<Progress
							value={percentage}
							colorScheme={color}
							size="md"
							w="full"
							borderRadius="full"
						/>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
};

export default ProgressCard;
