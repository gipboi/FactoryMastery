import { isEmpty } from 'lodash';
import trim from 'lodash/trim';
import { AggregationPipeline } from 'types/common/aggregation';
import { generateMatchObjectIdsQuery, getValidArray } from 'utils/common';

export function getGroupsPipeline(
  organizationId: string,
  limit: number,
  skip: number,
  keyword: string,
  isCounting?: boolean,
  sortBy?: string,
  userIds?: string[],
  collectionIds?: string[]
): AggregationPipeline {
  const sort = sortBy ? sortBy : 'name';
  const pipeline: AggregationPipeline = [
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
        isDeleted: { $ne: true },
        name: {
          $regex: `.*${trim(keyword)}.*`,
          $options: 'i',
        },
      },
    },
    {
      $lookup: {
        from: 'groupmembers',
        localField: '_id',
        foreignField: 'groupId',
        as: 'members',
      },
    },
    {
      $lookup: {
        from: 'collectiongroups',
        localField: '_id',
        foreignField: 'groupId',
        let: { groupId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$groupId', '$$groupId'],
              },
            },
          },
          {
            $lookup: {
              from: 'collections',
              let: { collectionId: '$collectionId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: [
                            '$organizationId',
                            {
                              $toObjectId: organizationId,
                            },
                          ],
                        },
                        { $eq: ['$_id', '$$collectionId'] },
                        {
                          $or: [
                            { $eq: ['$archivedAt', null] },
                            { $not: ['$archivedAt'] },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'collection',
            },
          },
          {
            $match: {
              collection: { $ne: [] },
            },
          },
        ],
        as: 'collectionGroups',
      },
    },
  ];

  if (!isEmpty(collectionIds)) {
    pipeline.push(
      generateMatchObjectIdsQuery(
        'collectionGroups',
        'collectionId',
        getValidArray(collectionIds)
      )
    );
  }

  if (!isEmpty(userIds)) {
    pipeline.push(
      generateMatchObjectIdsQuery('members', 'userId', getValidArray(userIds))
    );
  }

  if (!isCounting) {
    const dataPipeline: AggregationPipeline = [
      {
        $lookup: {
          from: 'groupmembers',
          localField: '_id',
          foreignField: 'groupId',
          as: 'members',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'users',
          pipeline: [
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
                disabled: false,
              },
            },
          ],
        },
      },
      {
        $sort: {
          [sort]: 1,
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
          _id: false,
          id: '$_id',
          name: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          isCompanyGroup: true,
          archived: true,
          isDeleted: true,
          numberOfMembers: {
            $size: '$users',
          },
          numberOfCollections: {
            $size: '$collectionGroups',
          },
        },
      },
    ];
    pipeline.push(...dataPipeline);
  } else {
    const countPipeline: AggregationPipeline = [
      {
        $count: 'totalResults',
      },
    ];
    pipeline.push(...countPipeline);
  }

  return pipeline;
}
