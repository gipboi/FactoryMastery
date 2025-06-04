/* eslint-disable max-lines */
import { SupportMessageThreadStatus } from 'interfaces/message';
import { IUserWithRelations } from 'interfaces/user';
import escapeRegExp from 'lodash/escapeRegExp';
import trim from 'lodash/trim';
import {
	ESupportThreadSortBy,
	ProcessPublishStatus,
} from 'pages/SupportInboxPage/constants';
import { getValidArray } from './common';

function getSupportThreadSort(sortBy?: ESupportThreadSortBy) {
	if (sortBy === ESupportThreadSortBy.UNCLAIMED_FIRST) {
		return { status: 1, lastMessageAt: -1 };
	}
	if (sortBy === ESupportThreadSortBy.NAME) {
		return { 'step.name': 1 };
	}
	if (sortBy === ESupportThreadSortBy.NEWEST) {
		return { lastMessageAt: -1 };
	}
	if (sortBy === ESupportThreadSortBy.UPDATED) {
		return { updatedAt: -1 };
	}
	return { lastMessageAt: -1 };
}

export function getSupportMessageThread(
	organizationId: string = '',
	sortBy: ESupportThreadSortBy | undefined,
	status: SupportMessageThreadStatus[] | undefined,
	publishStatus: ProcessPublishStatus | undefined,
	keyword: string,
	limit: number,
	userId: string,
	isBasicUser: boolean,
	isUnclaimed: boolean,
	isClaimedByMe: boolean,
	isClaimedByOthers: boolean,
	isResolved: boolean,
	participants: IUserWithRelations[],
	isCount?: boolean
) {
	let pipeline: any[] = [
		{
			$match: {
				$expr: {
					$eq: [
						'$organizationId',
						{
							$toObjectId: organizationId,
						},
					],
				},
			},
		},
		{
			$lookup: {
				from: 'supportmessages',
				localField: '_id',
				foreignField: 'supportThreadId',
				as: 'supportMessages',
			},
		},
		{
			$unwind: {
				path: '$supportMessages',
			},
		},
		{
			$sort: {
				'supportMessages.createdAt': -1,
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: 'supportMessages.userId',
				foreignField: '_id',
				as: 'supportMessages.user',
			},
		},
		{
			$unwind: {
				path: '$supportMessages.user',
			},
		},
		{
			$group: {
				_id: '$_id',
				id: {
					$first: '$_id',
				},
				createdAt: {
					$first: '$createdAt',
				},
				updatedAt: {
					$first: '$updatedAt',
				},
				lastMessageAt: {
					$first: '$lastMessageAt',
				},
				name: {
					$first: '$name',
				},
				subject: {
					$first: '$subject',
				},
				processId: {
					$first: '$processId',
				},
				status: {
					$first: '$status',
				},
				organizationId: {
					$first: '$organizationId',
				},
				stepId: {
					$first: '$stepId',
				},
				supportMessage: {
					$first: '$supportMessages',
				},
				supportMessages: {
					$push: '$supportMessages',
				},
				claimedBy: {
					$first: '$claimedBy',
				},
			},
		},
		{
			$lookup: {
				from: 'steps',
				localField: 'stepId',
				foreignField: '_id',
				pipeline: [
					{
						$lookup: {
							from: 'steps',
							localField: 'originalStepId',
							foreignField: '_id',
							as: 'originalSteps',
						},
					},
					{
						$addFields: {
							originalStep: { $arrayElemAt: ['$originalSteps', 0] },
						},
					},
				],
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
			$sort: getSupportThreadSort(sortBy),
		},
		{
			$lookup: {
				from: 'processes',
				localField: 'step.processId',
				foreignField: '_id',
				as: 'step.process',
			},
		},
		{
			$unwind: {
				path: '$step.process',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$lookup: {
				from: 'processes',
				localField: 'processId',
				foreignField: '_id',
				as: 'process',
				pipeline: [
					{
						$lookup: {
							from: 'documenttypes',
							localField: 'documentTypeId',
							foreignField: '_id',
							as: 'documentType',
							pipeline: [
								{
									$lookup: {
										from: 'Icon',
										localField: 'iconId',
										foreignField: '_id',
										as: 'iconBuilder',
									},
								},
								{
									$unwind: {
										path: '$iconBuilder',
										preserveNullAndEmptyArrays: true,
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$documentType',
							preserveNullAndEmptyArrays: true,
						},
					},
				],
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
				from: 'supportmessagethreaduserseens',
				let: {
					supportThreadId: '$_id',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$supportThreadId', '$$supportThreadId'],
									},
									{
										$eq: [
											'$userId',
											{
												$toObjectId: userId,
											},
										],
									},
								],
							},
						},
					},
				],
				as: 'supportMessageThreadUserSeens',
			},
		},
		{
			$lookup: {
				from: 'supportmessagethreadusers',
				localField: '_id',
				foreignField: 'supportThreadId',
				as: 'supportMessageThreadUsers',
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: 'supportMessageThreadUsers.userId',
				foreignField: '_id',
				as: 'users',
			},
		},
		{
			$match: {
				$or: [
					{
						'step.name': {
							$regex: `.*${escapeRegExp(trim(keyword))}.*`,
							$options: 'i',
						},
					},
					{
						'process.name': {
							$regex: `.*${escapeRegExp(trim(keyword))}.*`,
							$options: 'i',
						},
					},
					{
						subject: {
							$regex: `.*${escapeRegExp(trim(keyword))}.*`,
							$options: 'i',
						},
					},
				],
			},
		},
	];

	if (isBasicUser) {
		pipeline = [
			...pipeline,
			{
				$addFields: {
					userIds: {
						$concatArrays: [
							'$supportMessages.userId',
							'$supportMessageThreadUserSeens.userId',
						],
					},
				},
			},

			{
				$match: {
					$or: [
						{
							$expr: {
								$in: [{ $toObjectId: userId }, '$userIds'],
							},
						},
						{
							$expr: {
								$eq: ['$step.process.userId', { $toObjectId: userId }],
							},
						},
					],
				},
			},
			{
				$unset: 'userIds',
			},
		];
	}

	if (isUnclaimed || isClaimedByMe || isClaimedByOthers || isResolved) {
		pipeline[0].$match.$or = [];
		if (isUnclaimed) {
			pipeline[0].$match.$or.push({
				status: SupportMessageThreadStatus.UNCLAIMED,
			});
		}
		if (isResolved) {
			pipeline[0].$match.$or.push({
				status: SupportMessageThreadStatus.RESOLVED,
			});
		}
		if (isClaimedByMe) {
			pipeline[0].$match.$or.push({
				$expr: {
					$eq: [
						'$claimedBy',
						{
							$toObjectId: userId,
						},
					],
				},
			});
		}
		if (isClaimedByOthers) {
			pipeline[0].$match.$or.push({
				$expr: {
					$ne: [
						'$claimedBy',
						{
							$toObjectId: userId,
						},
					],
				},
			});
		}
	}

	if (participants?.length > 0) {
		const participantIds = participants.map((participant) => participant?.id);
		pipeline = [
			...pipeline,
			{
				$match: {
					$expr: {
						$anyElementTrue: {
							$map: {
								input: '$supportMessages',
								as: 'message',
								in: {
									$in: [
										'$$message.userId',
										getValidArray(participantIds).map((id) => ({
											$toObjectId: id,
										})),
									],
								},
							},
						},
					},
				},
			},
		];
	}

	if (!isCount) {
		pipeline = [
			...pipeline,
			{
				$limit: limit,
			},
		];
	}

	if (publishStatus) {
		const booleanValue =
			publishStatus === ProcessPublishStatus.DRAFT ? false : true;
		pipeline[15] = {
			$match: {
				'step.name': {
					$regex: `.*${escapeRegExp(trim(keyword))}.*`,
					$options: 'i',
				},
				'step.process.isPublished': booleanValue,
			},
		};
	}

	return pipeline;
}
