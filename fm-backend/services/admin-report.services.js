import mongoose from 'mongoose';
import { getValidArray, handleError, successHandler } from '../utils/index.js';
import dayjs from 'dayjs';
import {
	getCompanyReportTablePipeline,
	getGeneralCompanyReportPipeline,
} from '../utils/report.pipeline.js';
import Organization from '../schemas/organization.schema.js';
import { EOrganizationLicense } from '../constants/enums/organization.enum.js';
import User from '../schemas/user.schema.js';
import Process from '../schemas/process.schema.js';
import ProcessRating from '../schemas/processRating.schema.js';
import DocumentType from '../schemas/documentType.schema.js';
import Tag from '../schemas/tag.schema.js';
import Favorite from '../schemas/favorite.schema.js';
import Collection from '../schemas/collection.schema.js';
import Group from '../schemas/group.schema.js';
import { AuthRoleEnum } from '../constants/enums/auth-role.enum.js';
import SupportMessageThread from '../schemas/supportMessageThread.schema.js';
import { SupportMessageThreadPriorityEnum, SupportMessageThreadStatusEnum } from '../constants/enums/message.enum.js';

export class AdminReportService {
	constructor() {}

	async getCompanyReport(req, res, next) {
		try {
			const { startDate, endDate, licenses } = req?.body;
			const {
				startOfCurrentPeriod,
				endOfCurrentPeriod,
				startOfPreviousPeriod,
				endOfPreviousPeriod,
			} = this.getTimeRange(startDate, endDate);

			const currentSummaryPipeline = getGeneralCompanyReportPipeline(
				licenses,
				startOfCurrentPeriod.toDate(),
				endOfCurrentPeriod.toDate()
			);

			const previousSummaryPipeline = getGeneralCompanyReportPipeline(
				licenses,
				startOfPreviousPeriod.toDate(),
				endOfPreviousPeriod.toDate()
			);

			const [currentSummary, previousSummary] = await Promise.all([
				Organization.aggregate(currentSummaryPipeline),
				Organization.aggregate(previousSummaryPipeline),
			]);

			const [
				currentTotalCompany,
				currentTotalProcess,
				currentTotalCollection,
				currentTotalUser,
			] = [
				currentSummary[0]?.totalCompany,
				currentSummary[0]?.totalProcess,
				currentSummary[0]?.totalCollection,
				currentSummary[0]?.totalUser,
			];

			const [
				previousTotalCompany,
				previousTotalProcess,
				previousTotalCollection,
				previousTotalUser,
			] = [
				previousSummary[0]?.totalCompany,
				previousSummary[0]?.totalProcess,
				previousSummary[0]?.totalCollection,
				previousSummary[0]?.totalUser,
			];

			const companyPercentChange = this.calculatePercentChange(
				currentTotalCompany,
				previousTotalCompany
			);
			const processPercentChange = this.calculatePercentChange(
				currentTotalProcess,
				previousTotalProcess
			);
			const collectionPercentChange = this.calculatePercentChange(
				currentTotalCollection,
				previousTotalCollection
			);
			const userPercentChange = this.calculatePercentChange(
				currentTotalUser,
				previousTotalUser
			);

			successHandler(
				res,
				{
					totalCompany: {
						total: currentTotalCompany,
						percentChange: companyPercentChange,
					},
					totalProcess: {
						total: currentTotalProcess,
						percentChange: processPercentChange,
					},
					totalCollection: {
						total: currentTotalCollection,
						percentChange: collectionPercentChange,
					},
					totalUser: {
						total: currentTotalUser,
						percentChange: userPercentChange,
					},
				},
				'Get admin report Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/admin-report.services.js',
				'getCompanyReport'
			);
		}
	}

	async getCompanyReportTable(req, res, next) {
		try {
			const payload = req?.body;
			const { startDate, endDate, licenses, name = '' } = payload;
			const startTime = dayjs(startDate);
			const endTime = dayjs(endDate);

			const companyTablePipeline = getCompanyReportTablePipeline(
				startTime.toDate(),
				endTime.toDate(),
				payload
			);

			const matchLicense =
				getValidArray(licenses).length === 0
					? [{}]
					: [
							{ license: { inq: getValidArray(licenses) } },
							{ license: { eq: undefined } },
					  ];
			const matchLicenses =
				getValidArray(licenses).length === 0 ||
				getValidArray(licenses).includes(EOrganizationLicense.FREE)
					? { or: matchLicense }
					: { license: { inq: getValidArray(licenses) } };
			const [paginationList, countResponse] = await Promise.all([
				Organization.aggregate(companyTablePipeline),
				Organization.aggregate([
					{
						$match: {
							name: { $regex: name, $options: 'i' },
							...matchLicenses,
						},
					},
					{
						$count: 'total',
					},
				]).then((result) => result[0]?.total || 0),
			]);

			successHandler(
				res,
				{
					results: getValidArray(paginationList),
					totalCount: countResponse.count,
				},
				'Get company table report Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/admin-report.services.js',
				'getCompanyReportTable'
			);
		}
	}

	async updateAdminOrganizationById(req, res, next) {
		try {
			const { organizationId } = req.params;
			let organizationData = req?.body;

			const currentOrganization = await Organization.findOne({
				_id: organizationId,
			});

			if (!currentOrganization) {
				throw createError(404, 'Organization not found');
			}

			if (
				organizationData?.name &&
				organizationData?.name !== currentOrganization.name
			) {
				await this.validateExistOrganization(organizationData?.name);
			}

			const updatedOrganization = await Organization.findOneAndUpdate(
				{
					_id: organizationId,
				},
				organizationData
			);

			successHandler(
				res,
				{
					...updatedOrganization,
					...organizationData,
				},
				'Update Organization Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/admin-report.services.js',
				'updateAdminOrganizationById'
			);
		}
	}

	async getCompanyReportDetail(req, res, next) {
		try {
			const { organizationId } = req.params;
			const { startDate, endDate } = req.body;

			const [
				currentOrganization,
				totalUser,
				totalProcess,
				totalCollection = 0,
				totalLogin = 0,
				totalView = 0,
				totalEdit = 0,
			] = await Promise.all([
				Organization.findOne({
					_id: organizationId,
				}),
				User.countDocuments({
					...this.getFilterByPeriod(startDate, endDate, organizationId),
				}),
				Process.countDocuments({
					...this.getFilterByPeriod(startDate, endDate, organizationId),
					$or: [{ archivedAt: undefined }, { archivedAt: null }],
				}),
				// Collection.count({
				//   ...this.getFilterByPeriod(startDate, endDate, organizationId),
				// }),
				// AudiTrail.count({
				//   ...this.getFilterByPeriod(startDate, endDate, organizationId),
				//   action: EAuditAction.LOGIN,
				// }),
				// AudiTrail.count({
				//   ...this.getFilterByPeriod(startDate, endDate, organizationId),
				//   action: EAuditAction.VIEW,
				// }),
				// AudiTrail.count({
				//   ...this.getFilterByPeriod(startDate, endDate, organizationId),
				//   action: EAuditAction.UPDATE,
				// }),
			]);

			if (!currentOrganization) {
				throw createError(404, 'Organization not found');
			}

			successHandler(
				res,
				{
					...JSON.parse(JSON.stringify(currentOrganization)),
					totalUser: totalUser,
					totalProcess: totalProcess,
					totalCollection: totalCollection,
					totalLogin: totalLogin,
					totalView: totalView,
					totalEdit: totalEdit,
				},
				'Get Organization Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/admin-report.services.js',
				'getCompanyReportDetail'
			);
		}
	}

	getTimeRange(startDate, endDate) {
		const startOfCurrentPeriod = dayjs(startDate);
		const endOfCurrentPeriod = dayjs(endDate);
		const diff = endOfCurrentPeriod.diff(startOfCurrentPeriod, 'day');
		let startOfPreviousPeriod = startOfCurrentPeriod.subtract(diff, 'day');
		let endOfPreviousPeriod = endOfCurrentPeriod.subtract(diff, 'day');

		if (
			endOfCurrentPeriod.format('MM-DD-YYYY') ===
				dayjs().format('MM-DD-YYYY') &&
			startOfCurrentPeriod.format('MM-DD-YYYY') ===
				dayjs().startOf('year').format('MM-DD-YYYY')
		) {
			startOfPreviousPeriod = dayjs().subtract(1, 'year').startOf('year');
			endOfPreviousPeriod = dayjs(new Date()).subtract(1, 'year');
		}

		return {
			startOfCurrentPeriod,
			endOfCurrentPeriod,
			startOfPreviousPeriod,
			endOfPreviousPeriod,
		};
	}

	calculatePercentChange(currentTotal, previousTotal) {
		if (previousTotal === 0) return 0;
		return ((currentTotal - previousTotal) / previousTotal) * 100;
	}

	getFilterByPeriod(startOfPeriod, endOfPeriod, organizationId) {
		const filterCurrent = {
			organizationId,
			createdAt: {
				$gte: startOfPeriod,
				$lte: endOfPeriod,
			},
		};

		return filterCurrent;
	}

	// *INFO: Report for 1 organization;
	async getDashboardReport(req, res, next) {
		try {
			const { organizationId } = req.auth;
			const { period = 'week', startDate, endDate } = req.query;
			const dateRange = {
				startDate: new Date(startDate),
				endDate: new Date(endDate),
			};

			// Run all aggregations in parallel
			const [
				overviewStats,
				processStats,
				collectionStats,
				userStats,
				contentStats,
				processRatingData,
				userActivityData,
				weeklyActivityData,
				processTypeData,
				threadData,
			] = await Promise.all([
				this.getOverviewStats(organizationId, dateRange),
				this.getProcessStats(organizationId, dateRange),
				this.getCollectionStats(organizationId, dateRange),
				this.getUserStats(organizationId, dateRange),
				this.getContentStats(organizationId, dateRange),
				this.getProcessRatingData(organizationId, dateRange),
				this.getUserActivityData(organizationId, dateRange),
				this.getWeeklyActivityData(organizationId, dateRange),
				this.getProcessTypeData(organizationId, dateRange),
				this.getThreadData(organizationId, dateRange),
			]);

			const response = {
				stats: {
					overview: overviewStats,
					processes: processStats,
					collections: collectionStats,
					users: userStats,
					content: contentStats,
				},
				charts: {
					processRatingData,
					userActivityData,
					weeklyActivityData,
					processTypeData,
					threadData,
				},
				period,
				dateRange,
			};

			successHandler(
				res,
				response,
				'Get Organization Dashboard report Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/admin-report.services.js',
				'getDashboardReport'
			);
		}
	}

	// Get overview statistics
	async getOverviewStats(organizationId, dateRange) {
		const { startDate, endDate } = dateRange;
		const { startDate: prevStartDate, endDate: prevEndDate } =
			this.getPreviousPeriod(startDate, endDate);

		// Get current period stats
		const [currentStats, previousStats] = await Promise.all([
			this.getStatsForPeriod(organizationId, startDate, endDate),
			this.getStatsForPeriod(organizationId, prevStartDate, prevEndDate),
		]);

		return {
			collections: {
				value: currentStats.collections,
				change: this.calculateChange(
					currentStats.collections,
					previousStats.collections
				),
				changeType: this.getChangeType(
					currentStats.collections,
					previousStats.collections
				),
			},
			processes: {
				value: currentStats.processes,
				change: this.calculateChange(
					currentStats.processes,
					previousStats.processes
				),
				changeType: this.getChangeType(
					currentStats.processes,
					previousStats.processes
				),
			},
			groups: {
				value: currentStats.groups,
				change: this.calculateChange(currentStats.groups, previousStats.groups),
				changeType: this.getChangeType(
					currentStats.groups,
					previousStats.groups
				),
			},
			users: {
				value: currentStats.users,
				change: this.calculateChange(currentStats.users, previousStats.users),
				changeType: this.getChangeType(currentStats.users, previousStats.users),
			},
		};
	}

	// Get process-specific statistics
	async getProcessStats(organizationId, dateRange) {
		const { startDate, endDate } = dateRange;

		const [processStats, ratingStats] = await Promise.all([
			Process.aggregate([
				{
					$match: {
						organizationId: new mongoose.Types.ObjectId(organizationId),
						createdAt: { $gte: startDate, $lte: endDate },
					},
				},
				{
					$lookup: {
						from: 'steps',
						localField: '_id',
						foreignField: 'processId',
						as: 'steps',
					},
				},
				{
					$lookup: {
						from: 'processratings',
						localField: '_id',
						foreignField: 'processId',
						as: 'ratings',
					},
				},
				{
					$lookup: {
						from: 'favorites',
						localField: '_id',
						foreignField: 'processId',
						as: 'favorites',
					},
				},
				{
					$addFields: {
						favoriteCount: { $size: '$favorites' },
					},
				},
				{
					$group: {
						_id: null,
						totalSteps: { $sum: { $size: '$steps' } },
						completedSteps: {
							$sum: {
								$size: {
									$filter: {
										input: '$steps',
										cond: { $eq: ['$$this.archived', false] },
									},
								},
							},
						},
						totalFavorites: { $sum: { $size: '$favorites' } },
						totalRatings: { $sum: { $size: '$ratings' } },
						processes: {
							$push: {
								id: '$_id',
								name: '$name',
								favoriteCount: '$favoriteCount',
							},
						},
					},
				},
				{
					$addFields: {
						mostFavoriteProcess: {
							$let: {
								vars: {
									maxFavorites: { $max: '$processes.favoriteCount' },
								},
								in: {
									$arrayElemAt: [
										{
											$filter: {
												input: '$processes',
												cond: {
													$eq: ['$$this.favoriteCount', '$$maxFavorites'],
												},
											},
										},
										0,
									],
								},
							},
						},
					},
				},
				{
					$project: {
						totalSteps: 1,
						completedSteps: 1,
						totalFavorites: 1,
						totalRatings: 1,
						mostFavoriteProcess: {
							id: '$mostFavoriteProcess.id',
							name: '$mostFavoriteProcess.name',
						},
					},
				},
			]),
			ProcessRating.aggregate([
				{
					$lookup: {
						from: 'processes',
						localField: 'processId',
						foreignField: '_id',
						as: 'process',
					},
				},
				{
					$match: {
						'process.organizationId': new mongoose.Types.ObjectId(
							organizationId
						),
						createdAt: { $gte: startDate, $lte: endDate },
					},
				},
				{
					$group: {
						_id: null,
						avgRating: { $avg: '$rating' },
						highRated: {
							$sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] },
						},
					},
				},
			]),
		]);

		const processData = processStats?.[0] || {};
		const ratingData = ratingStats?.[0] || {};

		return {
			totalSteps: processData.totalSteps || 0,
			completedSteps: processData.completedSteps || 0,
			avgRating: Number((ratingData.avgRating || 0).toFixed(1)),
			pendingReview: await this.getPendingReviewCount(organizationId),
			favorites: processData.totalFavorites || 0,
			highRated: ratingData.highRated || 0,
			mostFavoriteProcess: processData?.mostFavoriteProcess,
		};
	}

	// Get collection-specific statistics
	async getCollectionStats(organizationId, dateRange) {
		const { startDate, endDate } = dateRange;

		const collectionStats = await Collection.aggregate([
			{
				$match: {
					organizationId: new mongoose.Types.ObjectId(organizationId),
					createdAt: { $gte: startDate, $lte: endDate },
				},
			},
			{
				$lookup: {
					from: 'favorites',
					localField: '_id',
					foreignField: 'collectionId',
					as: 'favorites',
				},
			},
			{
				$addFields: {
					favoriteCount: { $size: '$favorites' },
				},
			},
			{
				$group: {
					_id: null,
					totalFavorites: { $sum: { $size: '$favorites' } },
					collections: {
						$push: {
							id: '$_id',
							name: '$name',
							favoriteCount: '$favoriteCount',
						},
					},
				},
			},
			{
				$addFields: {
					mostFavoriteCollection: {
						$let: {
							vars: {
								maxFavorites: { $max: '$collections.favoriteCount' },
							},
							in: {
								$arrayElemAt: [
									{
										$filter: {
											input: '$collections',
											cond: {
												$eq: ['$$this.favoriteCount', '$$maxFavorites'],
											},
										},
									},
									0,
								],
							},
						},
					},
				},
			},
			{
				$project: {
					totalFavorites: 1,
					mostFavoriteCollection: {
						id: '$mostFavoriteCollection.id',
						name: '$mostFavoriteCollection.name',
					},
				},
			},
		]);

		const collectionData = collectionStats?.[0] || {};

		return {
			favorites: collectionData.totalFavorites || 0,
			mostFavoriteCollection: collectionData?.mostFavoriteCollection,
		};
	}

	// Get user statistics
	async getUserStats(organizationId, dateRange) {
		const { startDate, endDate } = dateRange;

		const userStats = await User.aggregate([
			{
				$match: {
					organizationId: new mongoose.Types.ObjectId(organizationId),
				},
			},
			{
				$lookup: {
					from: 'groupmembers',
					localField: '_id',
					foreignField: 'userId',
					as: 'groupMemberships',
				},
			},
			{
				$lookup: {
					from: 'favorites',
					localField: '_id',
					foreignField: 'userId',
					as: 'favorites',
				},
			},
			{
				$addFields: {
					isActive: {
						$cond: [
							{
								$gte: [
									'$lastSignInAt',
									new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
								],
							},
							true,
							false,
						],
					},
					isNewThisWeek: {
						$cond: [
							{
								$gte: [
									'$createdAt',
									new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
								],
							},
							true,
							false,
						],
					},
					isHighActivity: {
						$cond: [{ $gte: ['$signInCount', 20] }, true, false],
					},
				},
			},
			{
				$group: {
					_id: null,
					totalUsers: { $sum: 1 },
					activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
					viewers: {
						$sum: { $cond: [{ $eq: ['$authRole', 'viewer'] }, 1, 0] },
					},
					editors: {
						$sum: { $cond: [{ $eq: ['$authRole', 'editor'] }, 1, 0] },
					},
					admins: { $sum: { $cond: [{ $eq: ['$authRole', 'admin'] }, 1, 0] } },
					newThisWeek: { $sum: { $cond: ['$isNewThisWeek', 1, 0] } },
					highActivity: { $sum: { $cond: ['$isHighActivity', 1, 0] } },
				},
			},
		]);

		return (
			userStats[0] || {
				totalUsers: 0,
				activeUsers: 0,
				viewers: 0,
				editors: 0,
				admins: 0,
				newThisWeek: 0,
				highActivity: 0,
			}
		);
	}

	// Get content statistics
	async getContentStats(organizationId, dateRange) {
		const [documentTypes, tags, favorites, iconBuilders] = await Promise.all([
			DocumentType.countDocuments({
				organizationId: new mongoose.Types.ObjectId(organizationId),
			}),
			Tag.countDocuments({
				organizationId: new mongoose.Types.ObjectId(organizationId),
			}),
			Favorite.aggregate([
				{
					$match: {
						createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
					},
				},
				{
					$lookup: {
						from: 'processes',
						localField: 'processId',
						foreignField: '_id',
						as: 'process',
					},
				},
				{
					$unwind: {
						path: '$process',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$lookup: {
						from: 'collections',
						localField: 'collectionId',
						foreignField: '_id',
						as: 'collection',
					},
				},
				{
					$unwind: {
						path: '$collection',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$match: {
						$or: [
							{
								'process.organizationId': new mongoose.Types.ObjectId(
									organizationId
								),
							},
							{
								'collection.organizationId': new mongoose.Types.ObjectId(
									organizationId
								),
							},
						],
					},
				},
				{
					$count: 'total',
				},
			]).then((result) => result[0]?.total || 0),
			User.countDocuments({
				organizationId: new mongoose.Types.ObjectId(organizationId),
				authRole: { $in: [AuthRoleEnum.ORG_ADMIN, AuthRoleEnum.MANAGER] },
			}),
		]);

		return {
			documentTypes,
			tags,
			favorites,
			iconBuilders,
		};
	}

	// Get process rating data for charts
	async getProcessRatingData(organizationId, dateRange) {
		return await Process.aggregate([
			{
				$match: {
					organizationId: new mongoose.Types.ObjectId(organizationId),
					isPublished: true,
				},
			},
			{
				$lookup: {
					from: 'processratings',
					localField: '_id',
					foreignField: 'processId',
					as: 'ratings',
				},
			},
			{
				$lookup: {
					from: 'favorites',
					localField: '_id',
					foreignField: 'processId',
					as: 'favorites',
				},
			},
			{
				$lookup: {
					from: 'userprocesses',
					localField: '_id',
					foreignField: 'processId',
					as: 'userProcesses',
				},
			},
			{
				$addFields: {
					avgRating: { $avg: '$ratings.rating' },
					favoritesCount: { $size: '$favorites' },
					usersCount: { $size: '$userProcesses' },
				},
			},
			{
				$match: {
					avgRating: { $exists: true },
				},
			},
			{
				$sort: { avgRating: -1, favoritesCount: -1 },
			},
			{
				$limit: 6,
			},
			{
				$project: {
					name: 1,
					rating: { $round: ['$avgRating', 1] },
					favorites: '$favoritesCount',
					users: '$usersCount',
				},
			},
		]);
	}

	// Get user activity data for charts
	async getUserActivityData(organizationId, dateRange) {
		return await User.aggregate([
			{
				$match: {
					organizationId: new mongoose.Types.ObjectId(organizationId),
				},
			},
			{
				$lookup: {
					from: 'userprocesses',
					localField: '_id',
					foreignField: 'userId',
					as: 'userProcesses',
				},
			},
			{
				$addFields: {
					activity: {
						$min: [
							{
								$multiply: [
									{
										$add: [
											{ $multiply: ['$signInCount', 0.3] },
											{ $multiply: [{ $size: '$userProcesses' }, 2] },
											{
												$cond: [
													{
														$gte: [
															'$lastSignInAt',
															new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
														],
													},
													20,
													0,
												],
											},
										],
									},
									1,
								],
							},
							100,
						],
					},
				},
			},
			{
				$sort: { activity: -1 },
			},
			{
				$limit: 6,
			},
			{
				$project: {
					name: { $concat: ['$firstName', ' ', '$lastName'] },
					activity: { $round: ['$activity', 0] },
					image: '$image',
					role: {
						$switch: {
							branches: [
								{
									case: { $eq: ['$authRole', AuthRoleEnum.ORG_ADMIN] },
									then: AuthRoleEnum.ORG_ADMIN,
								},
								{
									case: { $eq: ['$authRole', AuthRoleEnum.MANAGER] },
									then: AuthRoleEnum.MANAGER,
								},
								{ case: { $eq: ['$authRole', 'editor'] }, then: 'Editor' },
								{ case: { $eq: ['$authRole', 'viewer'] }, then: 'Viewer' },
							],
							default: AuthRoleEnum.BASIC_USER,
						},
					},
					processes: { $size: '$userProcesses' },
					logins: '$signInCount',
				},
			},
		]);
	}

	// Get weekly activity data
	async getWeeklyActivityData(organizationId, dateRange) {
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const weeklyData = [];

		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dayStart = new Date(date.setHours(0, 0, 0, 0));
			const dayEnd = new Date(date.setHours(23, 59, 59, 999));

			const [userCount, processCount, favoriteCount] = await Promise.all([
				User.countDocuments({
					organizationId,
					lastSignInAt: { $gte: dayStart, $lte: dayEnd },
				}),
				Process.countDocuments({
					organizationId,
					createdAt: { $gte: dayStart, $lte: dayEnd },
				}),
				Favorite.aggregate([
					{
						$match: {
							createdAt: { $gte: dayStart, $lte: dayEnd },
						},
					},
					{
						$lookup: {
							from: 'processes',
							localField: 'processId',
							foreignField: '_id',
							as: 'process',
						},
					},
					{
						$unwind: {
							path: '$process',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$lookup: {
							from: 'collections',
							localField: 'collectionId',
							foreignField: '_id',
							as: 'collection',
						},
					},
					{
						$unwind: {
							path: '$collection',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$match: {
							$or: [
								{
									'process.organizationId': new mongoose.Types.ObjectId(
										organizationId
									),
								},
								{
									'collection.organizationId': new mongoose.Types.ObjectId(
										organizationId
									),
								},
							],
						},
					},
					{
						$count: 'total',
					},
				]).then((result) => result[0]?.total || 0),
			]);

			weeklyData.push({
				day: days[date.getDay()],
				users: userCount,
				processes: processCount,
				favorites: favoriteCount,
			});
		}

		return weeklyData;
	}

	// Get process type distribution
	async getProcessTypeData(organizationId, dateRange) {
		const processTypes = await Process.aggregate([
			{
				$match: {
					organizationId: new mongoose.Types.ObjectId(organizationId),
				},
			},
			{
				$lookup: {
					from: 'documenttypes',
					localField: 'documentTypeId',
					foreignField: '_id',
					as: 'documentType',
				},
			},
			{
				$group: {
					_id: {
						$ifNull: [
							{ $arrayElemAt: ['$documentType.name', 0] },
							'Uncategorized',
						],
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: 4,
			},
		]);

		const colors = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E'];

		return processTypes.map((type, index) => ({
			name: type._id,
			value: type.count,
			color: colors[index] || '#718096',
		}));
	}

	// Get comprehensive thread statistics and data for dashboard
	async getThreadData(organizationId, dateRange = {}) {
		const { startDate, endDate } = dateRange;

		const threads = await SupportMessageThread.aggregate([
			{
				$match: {
					organizationId: new mongoose.Types.ObjectId(organizationId),
					createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
				},
			},
			{
				$lookup: {
					from: 'processes',
					localField: 'processId',
					foreignField: '_id',
					as: 'process',
				},
			},
			{
				$unwind: {
					path: '$process',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'steps',
					localField: 'stepId',
					foreignField: '_id',
					as: 'step',
				},
			},
			{
				$unwind: {
					path: '$step',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$addFields: {
					newSubject: {
						$ifNull: [
							{
								$concat: [
									{
										$ifNull: ['$process.name', ''],
									},
									{
										$ifNull: ['$step.name', ''],
									},
								],
							},
							{
								$ifNull: ['$process.name', '$step.name', '$subject'],
							},
						],
					},
				},
			},
			{
				$project: {
					_id: 1,
					subject: '$newSubject',
					status: 1,
					priority: 1,
					lastMessageAt: 1,
					createdAt: 1,
					organizationId: 1,
				},
			},
		]);

		const stats = this.calculateThreadStats(threads);

		return {
			stats,
			statusDistribution: [
				{ name: 'Unclaimed', value: stats.unclaimed, color: '#E53E3E' },
				{ name: 'Claimed', value: stats.claimed, color: '#3182CE' },
				{ name: 'Resolved', value: stats.resolved, color: '#38A169' },
			],
			priorityDistribution: [
				{ name: 'Critical', value: stats.critical, color: '#FF0000' },
				{ name: 'High', value: stats.high, color: '#FFA07A' },
				{ name: 'Medium', value: stats.medium, color: '#007ACC' },
				{ name: 'Low', value: stats.low, color: '#6B7280' },
			],
		};
	}

	calculateThreadStats(threads) {
		const stats = {
			total: threads.length,
			unclaimed: 0,
			claimed: 0,
			resolved: 0,
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
		};

		threads.forEach((thread) => {
			switch (thread?.status) {
				case SupportMessageThreadStatusEnum.UNCLAIMED:
					stats.unclaimed++;
					break;
				case SupportMessageThreadStatusEnum.CLAIMED:
					stats.claimed++;
					break;
				case SupportMessageThreadStatusEnum.RESOLVED:
					stats.resolved++;
					break;
				default:
					break;
			}

			switch (thread?.priority) {
				case SupportMessageThreadPriorityEnum.URGENT:
					stats.critical++;
					break;
				case SupportMessageThreadPriorityEnum.HIGH:
					stats.high++;
					break;
				case SupportMessageThreadPriorityEnum.NORMAL:
					stats.medium++;
					break;
				case SupportMessageThreadPriorityEnum.LOW:
					stats.low++;
					break;
				default:
					break;
			}
		});

		return stats;
	}

	async getStatsForPeriod(organizationId, startDate, endDate) {
		const processCountData = await Process.countDocuments({
			organizationId,
			createdAt: { $gte: startDate, $lte: endDate },
		});

		const [processCount, collectionCount, groupCount, userCount] =
			await Promise.all([
				Process.countDocuments({
					organizationId,
					createdAt: { $gte: startDate, $lte: endDate },
				}),
				Collection.countDocuments({
					organizationId,
					createdAt: { $gte: startDate, $lte: endDate },
				}),
				Group.countDocuments({
					organizationId,
					createdAt: { $gte: startDate, $lte: endDate },
				}),
				User.countDocuments({
					organizationId,
					createdAt: { $gte: startDate, $lte: endDate },
				}),
			]);

		return {
			processes: processCount,
			collections: collectionCount,
			groups: groupCount,
			users: userCount,
		};
	}

	getPreviousPeriod(startDate, endDate) {
		const duration = endDate.getTime() - startDate.getTime();
		return {
			startDate: new Date(startDate.getTime() - duration),
			endDate: new Date(startDate.getTime()),
		};
	}

	calculateChange(current, previous) {
		if (previous === 0) return current > 0 ? '100%' : '0%';
		const change = ((current - previous) / previous) * 100;
		return `${Math.abs(change).toFixed(0)}%`;
	}

	getChangeType(current, previous) {
		if (current > previous) return 'increase';
		if (current < previous) return 'decrease';
		return 'neutral';
	}

	async getPendingReviewCount(organizationId) {
		return await Process.countDocuments({
			organizationId: new mongoose.Types.ObjectId(organizationId),
			status: 'pending',
		});
	}

	// Export functionality
	async exportReport(req, res, next) {
		try {
			const { organizationId } = req.auth;
			const { format = 'csv' } = req.params;

			// Get all data for export
			const reportData = await this.getDashboardReport(req, res, next);

			if (format === 'csv') {
				// Convert to CSV format
				const csv = this.convertToCSV(reportData);
				res.header('Content-Type', 'text/csv');
				res.attachment('report.csv');
				return res.send(csv);
			}

			res.json(reportData);
		} catch (error) {
			console.error('Export error:', error);
			res.status(500).json({ error: 'Failed to export report' });
		}
	}

	convertToCSV(data) {
		// Implement CSV conversion logic
		const headers = ['Metric', 'Value', 'Change', 'Period'];
		const rows = [
			[
				'Total Processes',
				data.stats.overview.processes.value,
				data.stats.overview.processes.change,
				data.period,
			],
			[
				'Total Collections',
				data.stats.overview.collections.value,
				data.stats.overview.collections.change,
				data.period,
			],
			[
				'Total Users',
				data.stats.overview.users.value,
				data.stats.overview.users.change,
				data.period,
			],
			// Add more rows as needed
		];

		return [headers, ...rows].map((row) => row.join(',')).join('\n');
	}
}
