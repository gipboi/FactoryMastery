import { getValidArray } from '.';
import { EAuditAction } from '../constants/enums/audit.enum';
import { EOrganizationLicense } from '../constants/enums/organization.enum';

export function getGeneralCompanyReportPipeline(licenses, startTime, endTime) {
	const matchLicense =
		getValidArray(licenses).length === 0
			? [{}]
			: [
					{ license: { $in: getValidArray(licenses) } },
					{ license: { $eq: null } },
			  ];
	const matchLicensePipeline =
		getValidArray(licenses).length === 0 ||
		getValidArray(licenses).includes(EOrganizationLicense.FREE)
			? [{ $match: { $or: matchLicense } }]
			: [{ $match: { license: { $in: getValidArray(licenses) } } }];

	const pipeline = [
		...matchLicensePipeline,
		{
			$facet: {
				totalCount: [
					{
						$match: {
							subdomain: { $ne: 'admin' },
							createdAt: { $gte: startTime, $lte: endTime },
						},
					},
					{ $count: 'total' },
				],
				totalBeforeMatch: [
					{
						$lookup: {
							from: 'processes',
							localField: '_id',
							foreignField: 'organizationId',
							as: 'processes',
							pipeline: [
								{
									$match: {
										createdAt: { $gte: startTime, $lte: endTime },
										archivedAt: { $eq: null },
									},
								},
							],
						},
					},
					{
						$lookup: {
							from: 'collections',
							localField: '_id',
							foreignField: 'organizationId',
							as: 'collections',
							pipeline: [
								{
									$match: {
										createdAt: { $gte: startTime, $lte: endTime },
									},
								},
							],
						},
					},
					{
						$lookup: {
							from: 'users',
							localField: '_id',
							foreignField: 'organizationId',
							as: 'users',
							pipeline: [
								{
									$match: {
										createdAt: { $gte: startTime, $lte: endTime },
									},
								},
							],
						},
					},
					{
						$project: {
							users: { $size: '$users' },
							collections: { $size: '$collections' },
							processes: { $size: '$processes' },
						},
					},
					{
						$group: {
							_id: null,
							totalProcess: { $sum: '$processes' },
							totalCollection: { $sum: '$collections' },
							totalUser: { $sum: '$users' },
						},
					},
				],
			},
		},
		{
			$project: {
				totalCompany: {
					$ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0],
				},
				totalProcess: {
					$ifNull: [{ $arrayElemAt: ['$totalBeforeMatch.totalProcess', 0] }, 0],
				},
				totalCollection: {
					$ifNull: [
						{ $arrayElemAt: ['$totalBeforeMatch.totalCollection', 0] },
						0,
					],
				},
				totalUser: {
					$ifNull: [{ $arrayElemAt: ['$totalBeforeMatch.totalUser', 0] }, 0],
				},
			},
		},
	];

	return pipeline;
}

export function getCompanyReportTablePipeline(startTime, endTime, payload) {
	const { skip, limit, name = '', licenses } = payload;
	// *INFO: Update pipeline below when migration updated all old organization license to FREE finished
	const matchLicense =
		getValidArray(licenses).length === 0
			? [{}]
			: [
					{ license: { $in: getValidArray(licenses) } },
					{ license: { $eq: null } },
			  ];
	const matchLicensePipeline =
		getValidArray(licenses).length === 0 ||
		getValidArray(licenses).includes(EOrganizationLicense.FREE)
			? [{ $match: { $or: matchLicense } }]
			: [{ $match: { license: { $in: getValidArray(licenses) } } }];

	return [
		{
			$match: {
				subdomain: { $ne: 'admin' },
				name: { $regex: name, $options: 'i' },
			},
		},
		...matchLicensePipeline,
		{
			$lookup: {
				from: 'auditTrails',
				localField: '_id',
				foreignField: 'organizationId',
				as: 'audit',
				pipeline: [
					{
						$match: {
							createdAt: { $gte: startTime, $lte: endTime },
						},
					},
				],
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: '_id',
				foreignField: 'organizationId',
				as: 'users',
				pipeline: [
					{
						$match: {
							createdAt: { $gte: startTime, $lte: endTime },
						},
					},
				],
			},
		},
		{
			$lookup: {
				from: 'processes',
				localField: '_id',
				foreignField: 'organizationId',
				as: 'processes',
				pipeline: [
					{
						$match: {
							createdAt: { $gte: startTime, $lte: endTime },
							archivedAt: { $eq: null },
						},
					},
				],
			},
		},
		{
			$lookup: {
				from: 'collections',
				localField: '_id',
				foreignField: 'organizationId',
				as: 'collections',
				pipeline: [
					{
						$match: {
							createdAt: { $gte: startTime, $lte: endTime },
						},
					},
				],
			},
		},
		{
			$sort: {
				lastSignInAt: -1,
				createdAt: -1,
			},
		},
		{
			$skip: skip,
		},
		{
			$limit: limit,
		},
		{
			$project: {
				_id: 0,
				id: '$_id',
				license: { $ifNull: ['$license', EOrganizationLicense.FREE] },
				name: 1,
				lastSignInAt: 1,
				user: { $size: '$users' },
				collection: { $size: '$collections' },
				process: { $size: '$processes' },
				login: {
					$size: {
						$filter: {
							input: '$audit',
							cond: { $eq: ['$$this.action', EAuditAction.LOGIN] },
						},
					},
				},
				view: {
					$size: {
						$filter: {
							input: '$audit',
							cond: { $eq: ['$$this.action', EAuditAction.VIEW] },
						},
					},
				},
				edit: {
					$size: {
						$filter: {
							input: '$audit',
							cond: { $eq: ['$$this.action', EAuditAction.UPDATE] },
						},
					},
				},
			},
		},
	];
}
