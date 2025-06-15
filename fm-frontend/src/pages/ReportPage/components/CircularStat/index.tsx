import React from 'react';
import { IconType } from 'react-icons';
import {
	Box,
	Card,
	CardBody,
	Text,
	HStack,
	VStack,
	Icon,
	useColorModeValue,
	CircularProgress,
	CircularProgressLabel,
} from '@chakra-ui/react';

interface CircularStatProps {
	title: string;
	value: number;
	max: number;
	color: string;
	icon: IconType;
	subtitle?: string;
}

const CircularStat: React.FC<CircularStatProps> = ({
	title,
	value,
	max,
	color,
	icon,
	subtitle,
}) => {
	const percentage = (value / max) * 100;
	const bgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.100', 'gray.600');

	return (
		<Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
			<CardBody p={6}>
				<VStack spacing={4}>
					<HStack spacing={2}>
						<Box p={2} borderRadius="lg" bg={color}>
							<Icon as={icon} color="white" boxSize="16px" />
						</Box>
						<Text fontSize="sm" color="gray.500" fontWeight="medium">
							{title}
						</Text>
					</HStack>

					<CircularProgress
						value={percentage}
						size="120px"
						thickness="8px"
						color={color}
						trackColor={useColorModeValue('gray.100', 'gray.600')}
					>
						<CircularProgressLabel>
							<VStack spacing={0}>
								<Text fontSize="xl" fontWeight="bold" color="gray.900">
									{value}
								</Text>
								<Text fontSize="xs" color="gray.500">
									of {max}
								</Text>
							</VStack>
						</CircularProgressLabel>
					</CircularProgress>

					{subtitle && (
						<Text fontSize="xs" color="gray.400" textAlign="center">
							{subtitle}
						</Text>
					)}
				</VStack>
			</CardBody>
		</Card>
	);
};

export default CircularStat;
