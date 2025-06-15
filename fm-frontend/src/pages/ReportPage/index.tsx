import React, { useEffect, useState } from 'react';
import {
	Box,
	Card,
	CardBody,
	Heading,
	Text,
	HStack,
	VStack,
	Badge,
	Progress,
	Icon,
	Button,
	SimpleGrid,
	Container,
	useColorModeValue,
	CircularProgress,
	CircularProgressLabel,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Avatar,
	Stack,
	FormControl,
} from '@chakra-ui/react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Area,
	AreaChart,
} from 'recharts';
import {
	FiDownload,
	FiUsers,
	FiMessageSquare,
	FiStar,
	FiClock,
	FiAlertCircle,
	FiLayers,
	FiActivity,
	FiHeart,
	FiTarget,
	FiZap,
} from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';
import useBreakPoint from 'hooks/useBreakPoint';
import { CustomDateRangePickerWithMask } from 'components/CustomDaterRangePickerWithMask';
import { EBreakPoint } from 'constants/theme';
import Dropdown from 'components/Dropdown';
import { EPeriod, periodOptions } from 'constants/report/period';
import { IDropdown } from 'types/common';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
	DATE_INPUT_FORMAT,
	DATE_INPUT_MASK,
	PICKER_DATE_FORMAT,
} from 'constants/common/date';
import { getTimeRangeByPeriod } from 'pages/CompanyReportPage';
import StatCard from './components/StatCard';
import CircularStat from './components/CircularStat';

const ReportPage: React.FC = () => {
	const methods = useForm();
	const { setValue, control } = methods;
	const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
	const [currentPeriod, setCurrentPeriod] = useState<IDropdown>(
		periodOptions[1]
	);
	const [isDisabled, setIsDisabled] = useState<boolean>(true);

	const bgColor = useColorModeValue('gray.50', 'gray.900');
	const cardBgColor = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.100', 'gray.600');
	const period: string = `${currentPeriod?.value}`;
	const modifiedDate: Date[] = useWatch({ control, name: 'modifiedDate' });

	// Mock data - replace with real data from your API
	const stats = {
		overview: {
			companies: { value: 24, change: '12%', changeType: 'increase' },
			processes: { value: 156, change: '8%', changeType: 'increase' },
			collections: { value: 89, change: '15%', changeType: 'increase' },
			users: { value: 342, change: '5%', changeType: 'increase' },
		},
		processes: {
			totalSteps: 1247,
			completedSteps: 1089,
			avgRating: 4.2,
			pendingReview: 23,
			favorites: 89,
			highRated: 67,
		},
		users: {
			activeUsers: 287,
			totalUsers: 342,
			viewers: 198,
			editors: 89,
			admins: 12,
			newThisWeek: 15,
			highActivity: 45,
		},
		messages: {
			totalMessages: 2156,
			threads: 89,
			unreadMessages: 23,
			avgResponseTime: '2.4h',
		},
		content: {
			documentTypes: 12,
			tags: 67,
			favorites: 234,
			iconBuilders: 8,
		},
	};

	// Chart data
	const processRatingData = [
		{ name: 'Manufacturing Setup', rating: 4.8, favorites: 45, users: 120 },
		{ name: 'Quality Control', rating: 4.6, favorites: 38, users: 98 },
		{ name: 'Inventory Management', rating: 4.3, favorites: 29, users: 87 },
		{ name: 'Safety Protocols', rating: 4.1, favorites: 22, users: 76 },
		{ name: 'Maintenance Schedule', rating: 3.9, favorites: 18, users: 65 },
		{ name: 'Equipment Calibration', rating: 3.7, favorites: 15, users: 54 },
	];

	const userActivityData = [
		{
			name: 'Sarah Johnson',
			activity: 95,
			role: 'Admin',
			processes: 23,
			logins: 89,
		},
		{
			name: 'Mike Chen',
			activity: 87,
			role: 'Editor',
			processes: 19,
			logins: 76,
		},
		{
			name: 'Emily Davis',
			activity: 82,
			role: 'Editor',
			processes: 17,
			logins: 68,
		},
		{
			name: 'John Smith',
			activity: 78,
			role: 'Viewer',
			processes: 12,
			logins: 45,
		},
		{
			name: 'Lisa Wilson',
			activity: 73,
			role: 'Editor',
			processes: 14,
			logins: 52,
		},
		{
			name: 'David Brown',
			activity: 67,
			role: 'Viewer',
			processes: 8,
			logins: 34,
		},
	];

	const weeklyActivityData = [
		{ day: 'Mon', users: 245, processes: 34, favorites: 12 },
		{ day: 'Tue', users: 289, processes: 42, favorites: 18 },
		{ day: 'Wed', users: 312, processes: 38, favorites: 15 },
		{ day: 'Thu', users: 298, processes: 45, favorites: 22 },
		{ day: 'Fri', users: 267, processes: 29, favorites: 14 },
		{ day: 'Sat', users: 198, processes: 18, favorites: 8 },
		{ day: 'Sun', users: 176, processes: 12, favorites: 6 },
	];

	const processTypeData = [
		{ name: 'Manufacturing', value: 45, color: '#3182CE' },
		{ name: 'Quality', value: 25, color: '#38A169' },
		{ name: 'Safety', value: 20, color: '#D69E2E' },
		{ name: 'Maintenance', value: 10, color: '#E53E3E' },
	];

	useEffect(() => {
		const { startTime, endTime } = getTimeRangeByPeriod(
			currentPeriod?.value as EPeriod
		);
		setValue('modifiedDate', [startTime, endTime]);
		setIsDisabled(currentPeriod.value !== EPeriod.CUSTOM);
	}, [currentPeriod.value]);

	return (
		<Box bg={bgColor} p={6} borderRadius={8}>
			<Container maxW="auto" m={0}>
				{/* Header */}
				<VStack align="flex-start" spacing={6} mb={8}>
					{/* Filters */}
					<Stack
						spacing={4}
						w="full"
						justify="space-between"
						flexDir={isMobile ? 'column' : 'row'}
					>
						<HStack spacing={4}>
							<Dropdown
								options={periodOptions}
								name="period"
								width={{ base: 'full', lg: 'auto' }}
								item={currentPeriod}
								setValue={(name: string, value: IDropdown) => {
									setCurrentPeriod(value);
								}}
							/>
							<VStack alignItems="flex-start">
								<FormControl>
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
													isDisabled={isDisabled}
													{...datePickerProps}
												/>
											);
										}}
									/>
								</FormControl>
							</VStack>
						</HStack>

						<HStack spacing={3}>
							<Button
								leftIcon={<FiDownload />}
								colorScheme="blue"
								variant="outline"
								size="sm"
							>
								Export CSV
							</Button>
						</HStack>
					</Stack>
				</VStack>

				{/* Main Overview Stats */}
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
					<StatCard
						title="Total Companies"
						value={stats.overview.companies.value}
						change={stats.overview.companies.change}
						changeType={stats.overview.companies.changeType as any}
						icon={HiOfficeBuilding}
						color="blue.500"
						helpText="Organizations registered"
					/>
					<StatCard
						title="Total Processes"
						value={stats.overview.processes.value}
						change={stats.overview.processes.change}
						changeType={stats.overview.processes.changeType as any}
						icon={FiActivity}
						color="green.500"
						helpText="Active workflows"
						badge={{
							text: `${stats.processes.highRated} high-rated`,
							color: 'green',
						}}
					/>
					<StatCard
						title="Total Collections"
						value={stats.overview.collections.value}
						change={stats.overview.collections.change}
						changeType={stats.overview.collections.changeType as any}
						icon={FiLayers}
						color="purple.500"
						helpText="Content groupings"
					/>
					<StatCard
						title="Total Users"
						value={stats.overview.users.value}
						change={stats.overview.users.change}
						changeType={stats.overview.users.changeType as any}
						icon={FiUsers}
						color="orange.500"
						helpText="Active participants"
						badge={{
							text: `${stats.users.highActivity} highly active`,
							color: 'orange',
						}}
					/>
				</SimpleGrid>

				{/* Circular Statistics */}
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
					<CircularStat
						title="Process Favorites"
						value={stats.processes.favorites}
						max={stats.overview.processes.value}
						color="pink.500"
						icon={FiHeart}
						subtitle="Most favorited processes"
					/>
					<CircularStat
						title="High-Rated Processes"
						value={stats.processes.highRated}
						max={stats.overview.processes.value}
						color="yellow.500"
						icon={FiStar}
						subtitle="4+ star rating"
					/>
					<CircularStat
						title="Highly Active Users"
						value={stats.users.highActivity}
						max={stats.overview.users.value}
						color="green.500"
						icon={FiZap}
						subtitle="80%+ activity score"
					/>
					<CircularStat
						title="Process Completion"
						value={stats.processes.completedSteps}
						max={stats.processes.totalSteps}
						color="blue.500"
						icon={FiTarget}
						subtitle="Steps completed"
					/>
				</SimpleGrid>

				{/* Charts Section */}
				<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
					{/* Process Rating & Favorites Bar Chart */}
					<Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px">
						<CardBody p={6}>
							<VStack align="flex-start" spacing={4}>
								<Heading size="md" color="gray.900">
									Top Processes by Rating & Favorites
								</Heading>
								<Box w="full" h="300px">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={processRatingData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												height={100}
												fontSize={12}
											/>
											<YAxis />
											<Tooltip />
											<Bar dataKey="rating" fill="#3182CE" name="Rating" />
											<Bar
												dataKey="favorites"
												fill="#E53E3E"
												name="Favorites"
											/>
										</BarChart>
									</ResponsiveContainer>
								</Box>
							</VStack>
						</CardBody>
					</Card>

					{/* Process Type Distribution Pie Chart */}
					<Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px">
						<CardBody p={6}>
							<VStack align="flex-start" spacing={4}>
								<Heading size="md" color="gray.900">
									Process Distribution
								</Heading>
								<Box w="full" h="300px">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={processTypeData}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({
													name,
													percent,
												}: {
													name: string;
													percent: number;
												}) => `${name} ${(percent * 100).toFixed(0)}%`}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{processTypeData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								</Box>
							</VStack>
						</CardBody>
					</Card>
				</SimpleGrid>

				{/* Weekly Activity Chart */}
				<Card
					bg={cardBgColor}
					borderColor={borderColor}
					borderWidth="1px"
					mb={8}
				>
					<CardBody p={6}>
						<VStack align="flex-start" spacing={4}>
							<Heading size="md" color="gray.900">
								Weekly Activity Trends
							</Heading>
							<Box w="full" h="300px">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={weeklyActivityData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="day" />
										<YAxis />
										<Tooltip />
										<Area
											type="monotone"
											dataKey="users"
											stackId="1"
											stroke="#3182CE"
											fill="#3182CE"
											fillOpacity={0.6}
										/>
										<Area
											type="monotone"
											dataKey="processes"
											stackId="1"
											stroke="#38A169"
											fill="#38A169"
											fillOpacity={0.6}
										/>
										<Area
											type="monotone"
											dataKey="favorites"
											stackId="1"
											stroke="#E53E3E"
											fill="#E53E3E"
											fillOpacity={0.6}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</Box>
						</VStack>
					</CardBody>
				</Card>

				{/* Top Users Activity Table */}
				<Card
					bg={cardBgColor}
					borderColor={borderColor}
					borderWidth="1px"
					mb={8}
				>
					<CardBody p={6}>
						<VStack align="flex-start" spacing={4}>
							<HStack justify="space-between" w="full">
								<Heading size="md" color="gray.900">
									Most Active Users
								</Heading>
								<Badge colorScheme="blue" variant="subtle">
									Top 6 Users
								</Badge>
							</HStack>
							<TableContainer w="full">
								<Table variant="simple" size="sm">
									<Thead>
										<Tr>
											<Th>User</Th>
											<Th>Role</Th>
											<Th isNumeric>Activity Score</Th>
											<Th isNumeric>Processes</Th>
											<Th isNumeric>Logins</Th>
											<Th>Activity Level</Th>
										</Tr>
									</Thead>
									<Tbody>
										{userActivityData.map((user, index) => (
											<Tr key={index}>
												<Td>
													<HStack spacing={3}>
														<Avatar size="sm" name={user.name} />
														<Text fontWeight="medium">{user.name}</Text>
													</HStack>
												</Td>
												<Td>
													<Badge
														colorScheme={
															user.role === 'Admin'
																? 'purple'
																: user.role === 'Editor'
																? 'blue'
																: 'gray'
														}
														variant="subtle"
													>
														{user.role}
													</Badge>
												</Td>
												<Td isNumeric>
													<Text fontWeight="bold" color="green.500">
														{user.activity}%
													</Text>
												</Td>
												<Td isNumeric>{user.processes}</Td>
												<Td isNumeric>{user.logins}</Td>
												<Td>
													<Progress
														value={user.activity}
														colorScheme={
															user.activity >= 80
																? 'green'
																: user.activity >= 60
																? 'yellow'
																: 'red'
														}
														size="sm"
														w="100px"
														borderRadius="full"
													/>
												</Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</TableContainer>
						</VStack>
					</CardBody>
				</Card>

				{/* Detailed Stats Grid */}
				<SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6} mb={8}>
					<StatCard
						title="Average Process Rating"
						value={`${stats.processes.avgRating}/5.0`}
						change="0.3"
						changeType="increase"
						icon={FiStar}
						color="yellow.500"
						helpText="User satisfaction score"
					/>

					<StatCard
						title="Most Favorited Process"
						value="Manufacturing Setup"
						icon={FiHeart}
						color="pink.500"
						helpText="45 favorites this week"
						badge={{ text: 'Top Pick', color: 'pink' }}
					/>

					<StatCard
						title="Pending Reviews"
						value={stats.processes.pendingReview}
						icon={FiAlertCircle}
						color="red.500"
						helpText="Processes awaiting approval"
					/>

					<StatCard
						title="Total Messages"
						value={stats.messages.totalMessages}
						change="23%"
						changeType="increase"
						icon={FiMessageSquare}
						color="#3F51B5"
						helpText="All communications"
					/>

					<StatCard
						title="Avg Response Time"
						value={stats.messages.avgResponseTime}
						change="0.3h"
						changeType="decrease"
						icon={FiClock}
						color="gray.500"
						helpText="Support response time"
					/>

					<StatCard
						title="User Favorites"
						value={stats.content.favorites}
						change="18%"
						changeType="increase"
						icon={FiStar}
						color="yellow.600"
						helpText="Bookmarked content"
					/>
				</SimpleGrid>
			</Container>
		</Box>
	);
};

export default ReportPage;
