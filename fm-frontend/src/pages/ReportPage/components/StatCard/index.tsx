import React from 'react';
import { IconType } from 'react-icons';
import {
	Box,
	Card,
	CardBody,
	Text,
	HStack,
	VStack,
	Badge,
	Icon,
	useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface StatCardProps {
	title: string;
	value: string | number;
	change?: string;
	changeType?: 'increase' | 'decrease';
	icon: IconType;
	color: string;
	helpText?: string;
	badge?: {
		text: string;
		color: string;
	};
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	change,
	changeType,
	icon,
	color,
	helpText,
	badge,
}) => {
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
				<VStack align="flex-start" spacing={3}>
					<HStack justify="space-between" w="full">
						<HStack spacing={2}>
							<Box p={2} borderRadius="lg" bg={color}>
								<Icon as={icon} color="white" boxSize="16px" />
							</Box>
							<Text fontSize="sm" color="gray.500" fontWeight="medium">
								{title}
							</Text>
							{badge && (
								<Badge colorScheme={badge.color} size="sm" borderRadius="full">
									{badge.text}
								</Badge>
							)}
						</HStack>
					</HStack>

					<Text fontSize="2xl" fontWeight="bold" color="gray.900">
						{value}
					</Text>

					{change && (
						<HStack spacing={1}>
							<Icon
								as={changeType === 'increase' ? FiArrowUp : FiArrowDown}
								color={changeType === 'increase' ? 'green.500' : 'red.500'}
								boxSize="12px"
							/>
							<Text
								fontSize="sm"
								color={changeType === 'increase' ? 'green.500' : 'red.500'}
								fontWeight="medium"
							>
								{change}
							</Text>
							<Text fontSize="sm" color="gray.500">
								vs last week
							</Text>
						</HStack>
					)}

					{helpText && (
						<Text fontSize="xs" color="gray.400">
							{helpText}
						</Text>
					)}
				</VStack>
			</CardBody>
		</Card>
	);
};

export default StatCard