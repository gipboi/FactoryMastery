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
	Button,
	SimpleGrid,
	Container,
	useColorModeValue,
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
	Tooltip as RechartsTooltip,
} from 'recharts';
import {
	FiDownload,
	FiUsers,
	FiStar,
	FiLayers,
	FiActivity,
	FiHeart,
	FiTarget,
	FiZap,
} from 'react-icons/fi';
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
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { MdGroups } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import routes from 'routes';
import { getPeriodLabel } from './uteil';
import UserTypeTag from 'pages/UserPage/components/UserList/components/UserTypeTag';
import { AuthRoleNameEnum } from 'constants/user';
import styles from '../UserPage/components/UserList/userList.module.scss';
import { primary500 } from 'themes/globalStyles';
import { toast } from 'react-toastify';

const ReportPage: React.FC = () => {
	const { reportStore, spinnerStore, userStore } = useStores();
	const { dashboardReport } = reportStore;
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
	const navigate = useNavigate();

	async function onSubmit(): Promise<void> {
		const [startTime, endTime] = modifiedDate;
		if (startTime && endTime) {
			spinnerStore.showLoading();
			await reportStore.getOrganizationReportDetail({
				startDate: startTime,
				endDate: endTime,
				period,
			});
			spinnerStore.hideLoading();
		}
	}

	const exportAllData = () => {
		const arrayToCSV = (data: any, headers: any) => {
			const csvHeaders = headers.join(',');
			const csvRows = data.map((row: any) =>
				headers
					.map((header: any) => {
						const value = row[header];
						let cellValue = '';
						if (typeof value === 'object' && value !== null) {
							cellValue = Object.entries(value)
								.map(([k, v]) => `${k}: ${v}`)
								.join('; ');
						} else {
							cellValue = String(value || '');
						}
						const escapedValue = cellValue.replace(/"/g, '""');
						return escapedValue.includes(',')
							? `"${escapedValue}"`
							: escapedValue;
					})
					.join(',')
			);
			return [csvHeaders, ...csvRows].join('\n');
		};

		const createSectionDivider = (title: any) => {
			const line = '━'.repeat(60);
			return `${line}\n${title.toUpperCase()}\n${line}`;
		};

		const createReadableOverview = (overview: any) => {
			const rows = [];
			rows.push(['📊 METRIC', '📈 VALUE', '🔄 CHANGE', '📋 TYPE']);
			rows.push(['', '', '', '']);

			Object.entries(overview).forEach(
				([key, data]: [key: any, value: any]) => {
					const metric = key.charAt(0).toUpperCase() + key.slice(1);
					const icon = getMetricIcon(key);
					rows.push([
						`${icon} ${metric}`,
						data?.value || 0,
						data?.change || 'N/A',
						data?.changeType || 'N/A',
					]);
				}
			);

			return rows.map((row) => row.join(',')).join('\n');
		};

		const getMetricIcon = (key: any) => {
			const icons = {
				collections: '📁',
				processes: '⚙️',
				groups: '👥',
				users: '👤',
				totalSteps: '📋',
				avgRating: '⭐',
				favorites: '❤️',
			};
			return icons?.[key as keyof typeof icons] || '📌';
		};

		const createProcessStats = (processStats: any) => {
			const rows = [];
			rows.push(['📊 PROCESS METRIC', '📈 VALUE']);
			rows.push(['', '']);

			Object.entries(processStats).forEach(
				([key, value]: [key: any, value: any]) => {
					if (key === 'mostFavoriteProcess') {
						rows.push(['🏆 Most Favorite Process ID', value?.id || 'N/A']);
						rows.push(['🏆 Most Favorite Process Name', value?.name || 'N/A']);
					} else {
						const metric = key.replace(/([A-Z])/g, ' $1').toLowerCase();
						const formattedMetric =
							metric.charAt(0).toUpperCase() + metric.slice(1);
						const icon = getMetricIcon(key);
						rows.push([`${icon} ${formattedMetric}`, value]);
					}
				}
			);

			return rows.map((row) => row.join(',')).join('\n');
		};

		const createCollectionStats = (collectionStats: any) => {
			const rows = [];
			rows.push(['📁 COLLECTION METRIC', '📈 VALUE']);
			rows.push(['', '']);

			Object.entries(collectionStats).forEach(
				([key, value]: [key: any, value: any]) => {
					if (key === 'mostFavoriteCollection') {
						rows.push(['🏆 Most Favorite Collection ID', value?.id || 'N/A']);
						rows.push([
							'🏆 Most Favorite Collection Name',
							value?.name || 'N/A',
						]);
					} else {
						const metric = key.replace(/([A-Z])/g, ' $1').toLowerCase();
						const formattedMetric =
							metric.charAt(0).toUpperCase() + metric.slice(1);
						rows.push([`❤️ ${formattedMetric}`, value]);
					}
				}
			);

			return rows.map((row) => row.join(',')).join('\n');
		};

		const createUserStats = (userStats: any) => {
			const rows = [];
			rows.push(['👤 USER METRIC', '📊 COUNT']);
			rows.push(['', '']);

			Object.entries(userStats).forEach(([key, value]) => {
				if (key !== '_id') {
					const metric = key.replace(/([A-Z])/g, ' $1').toLowerCase();
					const formattedMetric =
						metric.charAt(0).toUpperCase() + metric.slice(1);
					const icon = getUserIcon(key);
					rows.push([`${icon} ${formattedMetric}`, value || 0]);
				}
			});

			return rows.map((row) => row.join(',')).join('\n');
		};

		const getUserIcon = (key: any) => {
			const icons = {
				totalUsers: '👥',
				activeUsers: '🟢',
				viewers: '👁️',
				editors: '✏️',
				admins: '👑',
				newThisWeek: '✨',
				highActivity: '🔥',
			};
			return icons?.[key as keyof typeof icons] || '👤';
		};

		const createThreadStats = (threadData: any) => {
			const rows = [];
			rows.push(['🧵 THREAD METRIC', '📊 COUNT']);
			rows.push(['', '']);

			Object.entries(threadData.stats).forEach(([key, value]) => {
				const metric = key.charAt(0).toUpperCase() + key.slice(1);
				const icon = getThreadIcon(key);
				rows.push([`${icon} ${metric}`, value]);
			});

			return rows.map((row) => row.join(',')).join('\n');
		};

		const getThreadIcon = (key: any) => {
			const icons = {
				total: '📊',
				unclaimed: '🔴',
				claimed: '🔵',
				resolved: '✅',
				critical: '🚨',
				high: '🟠',
				medium: '🟡',
				low: '⚪',
			};
			return icons?.[key as keyof typeof icons] || '🧵';
		};

		const downloadCSV = (csvContent: any, filename: any) => {
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};

		let allCSV = '';

		const headerLine = '★'.repeat(80);
		allCSV += `${headerLine}\n`;
		allCSV += `🏢 DASHBOARD REPORT EXPORT\n`;
		allCSV += `📅 Generated: ${new Date().toLocaleString()}\n`;
		allCSV += `⏰ Period: ${dashboardReport?.period || 'All Time'}\n`;
		allCSV += `${headerLine}\n\n`;

		allCSV += createSectionDivider('📊 OVERVIEW STATISTICS');
		allCSV += '\n';
		allCSV += createReadableOverview(dashboardReport?.stats?.overview || {});
		allCSV += '\n\n';

		allCSV += createSectionDivider('⚙️ PROCESS STATISTICS');
		allCSV += '\n';
		allCSV += createProcessStats(dashboardReport?.stats?.processes || {});
		allCSV += '\n\n';

		if (dashboardReport?.stats?.collections) {
			allCSV += createSectionDivider('📁 COLLECTION STATISTICS');
			allCSV += '\n';
			allCSV += createCollectionStats(dashboardReport.stats.collections);
			allCSV += '\n\n';
		}

		allCSV += createSectionDivider('👤 USER STATISTICS');
		allCSV += '\n';
		allCSV += createUserStats(dashboardReport?.stats?.users || {});
		allCSV += '\n\n';

		if (dashboardReport?.charts?.threadData) {
			allCSV += createSectionDivider('🧵 THREAD STATISTICS');
			allCSV += '\n';
			allCSV += createThreadStats(dashboardReport.charts.threadData);
			allCSV += '\n\n';
		}

		allCSV += createSectionDivider('⭐ PROCESS RATINGS DETAIL');
		allCSV += '\n';
		allCSV += '🏆 Process Name,⭐ Rating,❤️ Favorites,👤 Users\n';
		allCSV += ',,,\n';
		allCSV += arrayToCSV(dashboardReport?.charts?.processRatingData || [], [
			'name',
			'rating',
			'favorites',
			'users',
		]);
		allCSV += '\n\n';

		allCSV += createSectionDivider('📈 USER ACTIVITY DETAIL');
		allCSV += '\n';
		allCSV += '👤 User Name,🔥 Activity,👑 Role,⚙️ Processes,🔐 Logins\n';
		allCSV += ',,,,\n';
		allCSV += arrayToCSV(dashboardReport?.charts?.userActivityData || [], [
			'name',
			'activity',
			'role',
			'processes',
			'logins',
		]);
		allCSV += '\n\n';

		allCSV += createSectionDivider('📋 PROCESS TYPES');
		allCSV += '\n';
		allCSV += '📝 Type Name,📊 Count,🎨 Color\n';
		allCSV += ',,\n';
		allCSV += arrayToCSV(dashboardReport?.charts?.processTypeData || [], [
			'name',
			'value',
			'color',
		]);
		allCSV += '\n\n';

		if (dashboardReport?.charts?.weeklyActivityData) {
			allCSV += createSectionDivider('📅 WEEKLY ACTIVITY');
			allCSV += '\n';
			allCSV += '📅 Day,👤 Users,⚙️ Processes,❤️ Favorites\n';
			allCSV += ',,,\n';
			allCSV += arrayToCSV(dashboardReport.charts.weeklyActivityData, [
				'day',
				'users',
				'processes',
				'favorites',
			]);
			allCSV += '\n\n';
		}

		if (dashboardReport?.charts?.threadData?.statusDistribution) {
			allCSV += createSectionDivider('📊 THREAD STATUS DISTRIBUTION');
			allCSV += '\n';
			allCSV += '📋 Status,📊 Count,🎨 Color\n';
			allCSV += ',,\n';
			allCSV += arrayToCSV(
				dashboardReport.charts.threadData.statusDistribution,
				['name', 'value', 'color']
			);
			allCSV += '\n\n';
		}

		if (dashboardReport?.charts?.threadData?.priorityDistribution) {
			allCSV += createSectionDivider('🚨 THREAD PRIORITY DISTRIBUTION');
			allCSV += '\n';
			allCSV += '🎯 Priority,📊 Count,🎨 Color\n';
			allCSV += ',,\n';
			allCSV += arrayToCSV(
				dashboardReport.charts.threadData.priorityDistribution,
				['name', 'value', 'color']
			);
			allCSV += '\n\n';
		}

		const footerLine = '★'.repeat(80);
		allCSV += `${footerLine}\n`;
		allCSV += `📄 End of Report - Generated by Dashboard System\n`;
		allCSV += `${footerLine}`;

		const filename = `dashboard-report-${
			new Date().toISOString().split('T')[0]
		}.csv`;
		downloadCSV(allCSV, filename);

		toast.success('Export CSV data of organization successfully!', {
			autoClose: 3000,
			closeButton: true,
		});
	};

	useEffect(() => {
		const { startTime, endTime } = getTimeRangeByPeriod(
			currentPeriod?.value as EPeriod
		);
		setValue('modifiedDate', [startTime, endTime]);
		setIsDisabled(currentPeriod.value !== EPeriod.CUSTOM);
	}, [currentPeriod.value]);

	useEffect(() => {
		if (modifiedDate) {
			onSubmit();
		}
	}, [modifiedDate]);

	return (
		<Box bg={bgColor} p={6} borderRadius={8}>
			<Container maxW="auto" m={0}>
				<VStack align="flex-start" spacing={6} mb={8}>
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
								onClick={exportAllData}
							>
								Export CSV
							</Button>
						</HStack>
					</Stack>
				</VStack>

				{/* Main Overview Stats */}
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
					<StatCard
						period={period}
						title="Total Collections"
						value={dashboardReport?.stats.overview.collections.value}
						change={dashboardReport?.stats.overview.collections.change}
						changeType={
							dashboardReport?.stats.overview.collections.changeType as any
						}
						icon={FiLayers}
						color="purple.500"
						helpText="Content groupings"
					/>
					<StatCard
						period={period}
						title="Total Processes"
						value={dashboardReport?.stats.overview.processes.value}
						change={dashboardReport?.stats.overview.processes.change}
						changeType={
							dashboardReport?.stats.overview.processes.changeType as any
						}
						icon={FiActivity}
						color="green.500"
						helpText="Active workflows"
						badge={{
							text: `${dashboardReport?.stats.processes.highRated} high-rated`,
							color: 'green',
						}}
					/>
					<StatCard
						period={period}
						title="Total Groups"
						value={dashboardReport?.stats?.overview?.groups?.value}
						change={dashboardReport?.stats?.overview?.groups?.change}
						changeType={
							dashboardReport?.stats?.overview?.groups?.changeType as any
						}
						icon={MdGroups}
						color="blue.500"
						helpText="Total number of active groups"
					/>
					<StatCard
						period={period}
						title="Total Users"
						value={dashboardReport?.stats.overview.users.value}
						change={dashboardReport?.stats.overview.users.change}
						changeType={dashboardReport?.stats.overview.users.changeType as any}
						icon={FiUsers}
						color="orange.500"
						helpText="Active participants"
						badge={{
							text: `${dashboardReport?.stats.users.highActivity} highly active`,
							color: 'orange',
						}}
					/>
				</SimpleGrid>

				{/* Circular Statistics */}
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
					<CircularStat
						title="Process Favorites"
						value={dashboardReport?.stats.processes.favorites}
						max={dashboardReport?.stats.overview.processes.value}
						color="pink.500"
						icon={FiHeart}
						subtitle="Most favorited processes"
					/>
					<CircularStat
						title="High-Rated Processes"
						value={dashboardReport?.stats.processes.highRated}
						max={dashboardReport?.stats.overview.processes.value}
						color="yellow.500"
						icon={FiStar}
						subtitle="4+ star rating"
					/>
					<CircularStat
						title="Collection Favorites"
						value={dashboardReport?.stats.collections.favorites}
						max={dashboardReport?.stats.overview.collections.value}
						color="teal.500"
						icon={FiHeart}
						subtitle="Most favorited collections"
					/>
					<CircularStat
						title="Highly Active Users"
						value={dashboardReport?.stats.users.highActivity}
						max={dashboardReport?.stats.overview.users.value}
						color="green.500"
						icon={FiZap}
						subtitle={`80%+ activity score`}
					/>
				</SimpleGrid>

				{/* Detailed Stats Grid */}
				<SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6} mb={8}>
					<StatCard
						period={period}
						title="Average Process Rating"
						value={`${dashboardReport?.stats.processes.avgRating}/5.0`}
						change="0.3"
						changeType="increase"
						icon={FiStar}
						color="yellow.500"
						helpText="User satisfaction score"
					/>

					<StatCard
						period={period}
						title="Most Favorited Process"
						value={
							dashboardReport?.stats?.processes?.mostFavoriteProcess?.name ??
							'No favorites at this time range'
						}
						icon={FiHeart}
						color="pink.500"
						helpText={`${
							dashboardReport?.stats?.processes?.favorites
						} favorites ${getPeriodLabel(period as EPeriod)}`}
						badge={{ text: 'Top Pick', color: 'pink' }}
						onClickText={() => {
							if (dashboardReport?.stats?.processes?.mostFavoriteProcess?.id) {
								navigate(
									routes.processes.processId.value(
										dashboardReport?.stats?.processes?.mostFavoriteProcess?.id
									)
								);
							}
						}}
					/>

					<StatCard
						period={period}
						title="Most Favorited Collection"
						value={
							dashboardReport?.stats?.collections?.mostFavoriteCollection
								?.name ?? 'No favorites at this time range'
						}
						icon={FiHeart}
						color="teal.500"
						helpText={`${
							dashboardReport?.stats?.collections?.favorites
						} favorites ${getPeriodLabel(period as EPeriod)}`}
						badge={{ text: 'Top Pick', color: 'teal' }}
						onClickText={() => {
							if (
								dashboardReport?.stats?.collections?.mostFavoriteCollection?.id
							) {
								navigate(
									routes.collections.collectionId.value(
										dashboardReport?.stats?.collections?.mostFavoriteCollection
											?.id
									)
								);
							}
						}}
					/>
				</SimpleGrid>

				{/* Charts Section */}
				<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
					{/* Status Distribution */}
					<Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px">
						<CardBody p={6}>
							<VStack align="flex-start" spacing={4}>
								<Heading size="md" color="gray.900">
									Thread Status Distribution
								</Heading>
								<Box w="full" h="300px">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={
													dashboardReport?.charts?.threadData
														?.statusDistribution
												}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name} ${(percent * 100).toFixed(0)}%`
												}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{dashboardReport?.charts?.threadData?.statusDistribution?.map(
													(entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													)
												)}
											</Pie>
											<RechartsTooltip />
										</PieChart>
									</ResponsiveContainer>
								</Box>
							</VStack>
						</CardBody>
					</Card>

					<Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px">
						<CardBody p={6}>
							<VStack align="flex-start" spacing={4}>
								<Heading size="md" color="gray.900">
									Priority Distribution
								</Heading>
								<Box w="full" h="300px">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={
													dashboardReport?.charts?.threadData
														?.priorityDistribution
												}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name} ${(percent * 100).toFixed(0)}%`
												}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{dashboardReport?.charts?.threadData?.priorityDistribution?.map(
													(entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													)
												)}
											</Pie>
											<RechartsTooltip />
										</PieChart>
									</ResponsiveContainer>
								</Box>
							</VStack>
						</CardBody>
					</Card>
				</SimpleGrid>

				{/* Charts Section */}
				<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
					{/* Process Type Distribution Pie Chart */}
					<Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px">
						<CardBody p={6}>
							<VStack align="flex-start" spacing={4}>
								<Heading size="md" color="gray.900">
									Document Type Distribution
								</Heading>
								<Box w="full" h="300px">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={dashboardReport?.charts?.processTypeData}
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
												{dashboardReport?.charts?.processTypeData.map(
													(
														entry: {
															name: string;
															value: number;
															color: string;
														},
														index
													) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													)
												)}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								</Box>
							</VStack>
						</CardBody>
					</Card>

					{/* Process Rating & Favorites Bar Chart */}
					<Card bg={cardBgColor} borderColor={borderColor} borderWidth="1px">
						<CardBody p={6}>
							<VStack align="flex-start" spacing={4}>
								<Heading size="md" color="gray.900">
									Top Processes by Rating & Favorites
								</Heading>
								<Box w="full" h="300px">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={dashboardReport?.charts?.processRatingData}>
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
									<AreaChart data={dashboardReport?.charts?.weeklyActivityData}>
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
								<Badge
									colorScheme="blue"
									variant="subtle"
									padding={2}
									borderRadius={4}
								>
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
										{dashboardReport?.charts?.userActivityData?.map(
											(user, index) => (
												<Tr key={index}>
													<Td>
														<HStack spacing={3}>
															<Avatar
																size={'sm'}
																src={user?.image}
																name={user?.name}
																className={styles.avatar}
																width={'30px !important'}
																height={'30px !important'}
															/>
															<Text
																className={styles.pointer}
																margin={0}
																_hover={{
																	cursor: 'pointer',
																	color: primary500,
																}}
																onClick={() => {
																	userStore.setManageModeInUserDetail(false);
																	navigate(
																		routes.users.userId.value(String(user?._id))
																	);
																}}
															>
																{user?.name ?? 'N/A'}
															</Text>
														</HStack>
													</Td>
													<Td>
														<UserTypeTag
															role={user?.role as AuthRoleNameEnum}
														/>
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
											)
										)}
									</Tbody>
								</Table>
							</TableContainer>
						</VStack>
					</CardBody>
				</Card>
			</Container>
		</Box>
	);
};

export default observer(ReportPage);
