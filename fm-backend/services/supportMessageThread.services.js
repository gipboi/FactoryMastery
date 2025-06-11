import createError from 'http-errors';
import SupportMessageThread from '../schemas/supportMessageThread.schema.js';
import {
	buildPopulateOptions,
	getValidArray,
	handleError,
	successHandler,
} from '../utils/index.js';
import Process from '../schemas/process.schema.js';
import User from '../schemas/user.schema.js';
import { AuthRoleEnum } from '../constants/enums/auth-role.enum.js';
import SupportMessageThreadUserSeen from '../schemas/supportMessageUserSeen.schema.js';
import SupportMessage from '../schemas/supportMessage.schema.js';
import Step from '../schemas/step.schema.js';
import { getAdminFromGroupsPipeline } from '../utils/message.js';
import dayjs from 'dayjs';
import { omit, unionBy } from 'lodash';
import SupportMessageThreadStatusHistory from '../schemas/supportMessageStatusHistory.schema.js';
import Notification from '../schemas/notification.schema.js';
import {
	NotificationTitleEnum,
	NotificationTitleMappedEnum,
	NotificationTypeEnum,
} from '../constants/enums/notification.enum.js';
import { SupportMessageThreadStatusValue } from '../constants/enums/message.enum.js';

class SupportMessageThreadUserSeenResponse {
	thread;
	isSeen;
	constructor(thread, isSeen) {
		this.thread = omit(thread, ['supportMessageThreadUserSeens']);
		this.isSeen = isSeen;
	}
}

export class SupportMessageThreadService {
	constructor() {}

	async get(req, res, next) {
		try {
			let filter = req?.query?.filter || {};
			if (typeof filter === 'string') {
				filter = JSON.parse(filter);
			}

			let populateOptions = [];

			if (filter?.include) {
				populateOptions = buildPopulateOptions(filter?.include);
			}

			const dataPromise = SupportMessageThread.find(filter?.where);

			if (filter?.offset) {
				dataPromise.skip(filter?.offset);
			}
			if (filter?.limit) {
				dataPromise.limit(filter?.limit);
			}

			const data = await dataPromise.populate(populateOptions);

			successHandler(res, data, 'Get SupportMessageThreads Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'get'
			);
		}
	}

	async getSupportMessages(req, res, next) {
		try {
			const { supportMessageThreadId: threadId } = req.params;
			const userId = req?.auth?._id;

			// Update or create seen record
			const seenData = await SupportMessageThreadUserSeen.find({
				supportThreadId: threadId,
				userId: userId,
			});

			if (seenData.length) {
				const seenId = seenData[0]._id;
				await SupportMessageThreadUserSeen.findByIdAndUpdate(seenId, {
					lastSeenAt: new Date(),
				});
			} else if (userId && threadId) {
				await SupportMessageThreadUserSeen.create({
					userId,
					supportThreadId: threadId,
					lastSeenAt: new Date(),
				});
			}

			// Process filter
			let filter = req?.query?.filter || {};
			if (typeof filter === 'string') {
				filter = JSON.parse(filter);
			}

			// Build query for messages in this thread
			let populateOptions = [];
			if (filter?.include) {
				populateOptions = buildPopulateOptions(filter?.include);
			}

			// Find messages belonging to this thread
			const dataPromise = SupportMessage.find({
				...(filter?.where || {}),
				supportThreadId: threadId,
			});

			if (filter?.offset) {
				dataPromise.skip(filter?.offset);
			}
			if (filter?.limit) {
				dataPromise.limit(filter?.limit);
			}

			const data = await dataPromise.populate(populateOptions);
			successHandler(res, data, 'Get SupportMessages Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'getSupportMessages'
			);
		}
	}

	async createSupportMessages(req, res, next) {
		try {
			const { supportMessageThreadId: threadId } = req.params;
			const userId = req?.auth?._id;
			const supportMessage = req.body;

			// Ensure the message has the necessary fields
			supportMessage.supportMessageThreadId = threadId;
			supportMessage.userId = userId;
			supportMessage.createdAt = new Date();

			// Update the thread's last message time
			await SupportMessageThread.updateOne(
				{ _id: threadId },
				{ lastMessageAt: new Date() }
			);

			// Create the new support message
			const newMessage = await SupportMessage.create(supportMessage);

			// Update the user's seen time
			await this.updateUserSeenTime(threadId, userId);

			successHandler(res, newMessage, 'Get SupportMessages Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'createSupportMessages'
			);
		}
	}

	async updateUserSeenTime(threadId, userId) {
		const seenData = await SupportMessageThreadUserSeen.findOne({
			supportThreadId: threadId,
			userId: userId,
		});

		if (seenData) {
			// Update existing seen record
			await SupportMessageThreadUserSeen.updateOne(
				{ _id: seenData._id },
				{ lastSeenAt: new Date() }
			);
		} else {
			// Create new seen record if one doesn't exist
			await SupportMessageThreadUserSeen.create({
				supportThreadId: threadId,
				userId: userId,
				lastSeenAt: new Date(),
			});
		}
	}

	async getByAggregation(req, res, next) {
		try {
			const pipeline = req?.body?.pipeline || [];
			const { startDate, endDate } = req?.body;
			const currentUserId = req?.auth?._id;
			const startTime = dayjs(startDate);
			const endTime = dayjs(endDate);
			const user = await User.findOne({ _id: currentUserId });
			pipeline.push({
				$match: {
					updatedAt: { $gte: user?.createdAt },
				},
			});
			if (startDate && endDate) {
				pipeline.push({
					$match: {
						lastMessageAt: { $gte: startTime.toDate(), $lte: endTime.toDate() },
					},
				});
			}
			const list = await SupportMessageThread.aggregate(pipeline);

			const data = [];
			for (const item of list) {
				const itemUserSeen = item.supportMessageThreadUserSeens?.find(
					(seenData) => String(seenData.userId) === String(currentUserId)
				);
				let resItem;
				if (!itemUserSeen) {
					resItem = new SupportMessageThreadUserSeenResponse(item, false);
				} else {
					resItem = new SupportMessageThreadUserSeenResponse(
						item,
						itemUserSeen.lastSeenAt >= item.lastMessageAt
					);
				}
				data.push(resItem);
			}

			successHandler(res, data, 'Get SupportMessageThreads Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'getByAggregation'
			);
		}
	}

	async create(req, res, next) {
		try {
			let supportMessageThreadData = req?.body;
			const createdBy = req?.auth?._id;
			supportMessageThreadData = await this.validateSupportMessageThread(
				supportMessageThreadData
			);
			let data;

			if (
				(supportMessageThreadData?.subject ||
					supportMessageThreadData.processId) &&
				!supportMessageThreadData?.stepId
			) {
				data = this.createNewSupportThreadWithoutStep(
					supportMessageThreadData,
					createdBy
				);
			} else {
				data = await this.createNewSupportThread(
					supportMessageThreadData,
					createdBy
				);
			}

			successHandler(res, data, 'Create SupportMessageThread Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'create'
			);
		}
	}

	async createNewSupportThreadWithoutStep(req, createdBy) {
		const newThread = await SupportMessageThread.create({
			organizationId: req?.organizationId,
			subject: req?.subject,
			processId: req?.processId,
			lastMessageAt: new Date(),
		});

		const participantIds = await this.getParticipantIdsByProcessId(
			req?.processId
		);
		const adminIds = await User.find({
			organizationId: req?.organizationId,
			$or: [
				{ authRole: AuthRoleEnum.ORG_ADMIN },
				{ authRole: AuthRoleEnum.MANAGER },
			],
		}, '_id');
		const userSeenData = participantIds?.map((adminId) => ({
			userId: String(adminId),
			supportThreadId: newThread._id,
			lastSeenAt: new Date(),
		})) ?? [];

		if (!adminIds.some((id) => id.toString() === req?.userId.toString())) {
			userSeenData.push({
				userId: req?.userId,
				supportThreadId: newThread._id,
				lastSeenAt: new Date(),
			});
		}

		await Promise.all([
			SupportMessageThreadUserSeen.insertMany(userSeenData),
			SupportMessage.create({
				content: req?.content,
				attachments: req?.attachments,
				supportThreadId: newThread._id,
				userId: req?.userId,
			}),
			SupportMessageThread.findOneAndUpdate(
				{
					_id: newThread._id,
				},
				{
					lastMessageAt: new Date(),
				},
				{ new: true }
			),
		]);

		const notification = {
			processId: req.processId,
			messageThreadId: newThread,
			organizationId: req?.organizationId,
			type: NotificationTypeEnum.COMMENT_NOTIFICATION,
			title: NotificationTitleEnum.COMMENT_STEP_NOTIFICATION,
			userId: req.userId,
			createdBy,
			deletedName: '',
		};

		Notification.insertMany(
			getValidArray(supportMessageThreadUsers).map((threadUser) => {
				return {
					...notification,
					userId: threadUser?.userId,
				};
			})
		);

		return newThread;
	}

	async createNewSupportThread(req, createdBy) {
		const threads = await SupportMessageThread.find({
			stepId: req.stepId,
		})
			.populate('supportMessages')
			.sort({ createdAt: -1 })
			.limit(1);

		const thread = threads[0];

		const newThread = await SupportMessageThread.create({
			organizationId: req.organizationId,
			stepId: req.stepId,
			lastMessageAt: new Date(),
		});

		const participantIds = await this.getParticipantIds(req.stepId);
		const userSeenData = participantIds?.map((participantId) => ({
			userId: String(participantId),
			supportThreadId: newThread._id,
			lastSeenAt: new Date(),
		})) ?? [];

		userSeenData.push({
			userId: String(req.userId),
			supportThreadId: newThread._id,
			lastSeenAt: new Date(),
		});

		const supportMessageThreadUsers = unionBy(userSeenData, 'userId');

		await Promise.all([
			SupportMessageThreadUserSeen.insertMany(supportMessageThreadUsers),
			SupportMessage.create({
				content: req.content,
				attachments: req.attachments,
				supportThreadId: newThread._id,
				userId: req.userId,
			}),
		]);

		const notification = {
			stepId: req.stepId,
			messageThreadId: newThread,
			organizationId: req?.organizationId,
			type: NotificationTypeEnum.COMMENT_NOTIFICATION,
			title: NotificationTitleEnum.COMMENT_STEP_NOTIFICATION,
			userId: req.userId,
			createdBy,
			deletedName: '',
		};

		Notification.insertMany(
			getValidArray(supportMessageThreadUsers).map((threadUser) => {
				return {
					...notification,
					userId: threadUser?.userId,
				};
			})
		);

		return thread ?? newThread;
	}

	async getParticipantIdsByProcessId(processId) {
		const processDetail = await Process.findOne({
			_id: processId,
		}).populate('creator');

		this.mappedParticipantsOfProcess(processDetail);
	}

	async getParticipantIds(stepId) {
		const stepDetails = await Step.findOne({
			_id: stepId,
		}).populate({
			path: 'process',
			populate: {
				path: 'creator',
			},
		});

		return this.mappedParticipantsOfProcess(stepDetails?.process);
	}

	async mappedParticipantsOfProcess(process) {
		const collaborators = process?.collaborators ?? [];
		let admins = [];
		if (process?.isPublished) {
			const pipeline = getAdminFromGroupsPipeline(process?.id);
			admins = await Process.aggregate(pipeline);
		}
		return [...admins, ...collaborators, process?.creator].map(
			(participant) => participant?.id || participant?._id
		);
	}

	async findById(req, res, next) {
		try {
			const { supportMessageThreadId } = req.params;
			const filter = JSON.parse(req.query.filter || '{}');

			let populateOptions = [];

			if (filter?.include) {
				populateOptions = buildPopulateOptions(filter?.include);
			}

			const currentSupportMessageThread = await SupportMessageThread.findOne({
				_id: supportMessageThreadId,
				...filter.where,
			}).populate(populateOptions);

			successHandler(
				res,
				currentSupportMessageThread,
				'Get SupportMessageThread Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'findById'
			);
		}
	}

	async updateById(req, res, next) {
		try {
			const { supportMessageThreadId } = req.params;
			const userId = req?.auth?._id;
			let supportMessageThreadData = req?.body;

			const currentSupportMessageThread = await SupportMessageThread.findOne({
				_id: supportMessageThreadId,
			});

			if (!currentSupportMessageThread) {
				throw createError(404, 'SupportMessageThread not found');
			}

			const [updatedSupportMessageThread, threadUsers] = await Promise.all([
				SupportMessageThread.findOneAndUpdate(
					{
						_id: supportMessageThreadId,
					},
					{
						...supportMessageThreadData,
						...(supportMessageThreadData?.claimedBy
							? { claimedBy: supportMessageThreadData?.claimedBy }
							: { claimedBy: undefined }),
					},
					{ new: true }
				)
					.populate({
						path: 'step',
						populate: { path: 'process' },
					})
					.populate('process'),
				SupportMessageThreadUserSeen.find({
					supportThreadId: supportMessageThreadId,
				}),
			]);

			SupportMessageThreadStatusHistory.create({
				threadId: supportMessageThreadId,
				userId,
				status: supportMessageThreadData?.status,
			});

			if (supportMessageThreadData?.status) {
				const threadName = updatedSupportMessageThread?.stepId
					? `${updatedSupportMessageThread?.step?.name} | ${updatedSupportMessageThread?.step?.process?.name}`
					: updatedSupportMessageThread?.processId
					? updatedSupportMessageThread?.process?.name
					: updatedSupportMessageThread?.subject;

				const notification = {
					processId: updatedSupportMessageThread?.processId,
					stepId: updatedSupportMessageThread.stepId,
					messageThreadId: supportMessageThreadId,
					organizationId: updatedSupportMessageThread?.organizationId,
					type: NotificationTypeEnum.UPDATED_THREAD_STATUS,
					title: NotificationTitleMappedEnum.UPDATED_THREAD_STATUS(
						threadName,
						SupportMessageThreadStatusValue?.[
							supportMessageThreadData?.status
						] ?? SupportMessageThreadStatusValue[0]
					),
					userId,
					createdBy: userId,
					deletedName: threadName || '',
				};

				Notification.insertMany(
					getValidArray(threadUsers).map((threadUser) => {
						return {
							...notification,
							userId: threadUser?.userId,
						};
					})
				);
			}

			successHandler(
				res,
				updatedSupportMessageThread,
				'Update SupportMessageThread Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'updateById'
			);
		}
	}

	async deleteById(req, res, next) {
		try {
			const { supportMessageThreadId } = req.params;
			await SupportMessageThread.deleteOne({
				_id: supportMessageThreadId,
			});

			successHandler(res, {}, 'Delete SupportMessageThread Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'deleteById'
			);
		}
	}

	async markSupportMessageThreadAsSeen(req, res, next) {
		try {
			const { supportMessageThreadId } = req.params;
			const userId = req?.auth?._id;

			await SupportMessageThreadUserSeen.updateOne(
				{
					userId,
					supportThreadId: supportMessageThreadId,
				},
				{
					lastSeenAt: new Date(),
				}
			);

			successHandler(res, {}, 'Mark SupportMessageThread as seen Successfully');
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'markSupportMessageThreadAsSeen'
			);
		}
	}

	async getStatusHistory(req, res, next) {
		try {
			const { supportMessageThreadId } = req.params;
			const userId = req?.auth?._id;
			const history = await SupportMessageThreadStatusHistory.find({
				threadId: supportMessageThreadId,
			})
				.populate({
					path: 'user',
					select: 'firstName lastName image',
				})
				.sort({ createdAt: -1 })
				.limit(10);

			successHandler(
				res,
				history,
				'Get status history of support message thread Successfully'
			);
		} catch (error) {
			handleError(
				next,
				error,
				'services/supportMessageThread.services.js',
				'getStatusHistory'
			);
		}
	}

	async validateSupportMessageThread(data) {
		if (!data?.organizationId) {
			throw createError(400, 'Organization Id is required');
		}

		return data;
	}

	async validateExistSupportMessageThread(id) {
		const foundSupportMessageThread = await SupportMessageThread.findOne({
			_id: id,
		});

		if (foundSupportMessageThread) {
			throw createError(403, 'SupportMessageThread already exist');
		}
	}
}
