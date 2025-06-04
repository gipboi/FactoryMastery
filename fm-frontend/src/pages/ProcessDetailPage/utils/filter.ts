import { IProcess } from 'interfaces/process';
import { IFilter } from 'types/common';

export const stepIncludes = [
	{
		relation: 'blocks',
		scope: {
			order: 'position ASC',
			include: [
				{
					//*TODO: Add decisionPoints later
					relation: 'decisionPoints',
					scope: {
						include: [
							{
								relation: 'decisionPointMedias',
								scope: {
									include: [
										{
											relation: 'media',
										},
									],
								},
							},
							{
								relation: 'decisionPointSteps',
								scope: {
									include: [
										{
											relation: 'step',
										},
									],
								},
							},
						],
						order: ['position ASC'],
					},
				},
				{
					relation: 'icon',
				},
				{
					//*TODO: Fix later
					relation: 'blockMedias',
					scope: {
						include: [
							{
								relation: 'media',
							},
						],
					},
				},
				{
					relation: 'media',
				},
			],
		},
	},
	{
		relation: 'media',
		scope: {
			order: 'createdAt ASC',
		},
	},
	{
		relation: 'icon',
	},
];

export function getProcessFilter(): IFilter<IProcess> {
	const stepFilter = {
		include: [
			...stepIncludes,
			{
				relation: 'originalStep',
				scope: {
					include: [...stepIncludes],
					order: 'position ASC',
				},
			},
			{
				relation: 'commonLibrary',
			},
		],
		order: 'position ASC',
	};

	const filter: IFilter<IProcess> = {
		include: [
			{
				relation: 'steps',
				scope: {
					...stepFilter,
				},
			},
			{
				relation: 'collections',
				scope: {
					where: {
						$or: [
							{ archivedAt: { $exists: false } } as any,
							{ archivedAt: { $eq: null } },
						],
					},
				},
			},
			{
				relation: 'collection',
			},
			{
				relation: 'documentType',
				scope: { include: [{ relation: 'iconBuilder' }] },
			},
			{
				relation: 'groups',
				scope: {
					include: [
						{
							relation: 'members',
							scope: {
								include: [
									{
										relation: 'member',
										scope: {
											fields: ['id', 'firstName', 'lastName', 'name', 'image'],
										},
									},
								],
							},
						},
					],
				},
			},
			{
				relation: 'tags',
			},
			{
				relation: 'creator',
			},
			{
				relation: 'collaborators',
			},
			{
				relation: 'userProcesses',
				scope: {
					include: [
						{
							relation: 'user',
						},
					],
				},
			},
		],
	};
	return filter;
}
