import mongoose from 'mongoose';
import trim from 'lodash/trim';
import { CollectionSortByEnum } from '../constants/enums/collection.enum';

const ObjectId = mongoose.Types.ObjectId;

function getCollectionsByFilterPipeline(
  filter,
  isBasicUser,
  groupIdsOfBasicUser,
  collectionIds
) {
  const {
    organizationId,
    sortBy,
    groupIds,
    processIds,
    documentTypeIds,
    tagIds,
    modifiedDate,
    skip,
    limit,
  } = filter;

  const matchDocumentTypeIds =
    documentTypeIds && documentTypeIds?.length > 0
      ? [
          {
            $match: {
              documentTypeId: {
                $in: documentTypeIds.map((x) =>
                  ObjectId.isValid(x) ? new ObjectId(x) : ''
                ),
              },
            },
          },
        ]
      : [];
  const matchTagIds =
    tagIds && tagIds?.length > 0
      ? [
          {
            $lookup: {
              from: 'processestags',
              localField: '_id',
              foreignField: 'processId',
              as: 'tags',
            },
          },
          {
            $match: {
              'tags.tagId': {
                $in: tagIds.map((x) =>
                  ObjectId.isValid(x) ? new ObjectId(x) : ''
                ),
              },
            },
          },
        ]
      : [];
  const pipeline = [
    {
      $match: {
        organizationId: new ObjectId(organizationId),
        name: { $regex: `.*${trim(filter?.name)}.*`, $options: 'i' },
        $or: [
          { archivedAt: { $exists: false } },
          { archivedAt: { $eq: null } },
        ],
        ...(isBasicUser ? { public: filter?.public } : {}),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdById',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    {
      $unwind: {
        path: '$createdBy',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        fullName: {
          $concat: ['$createdBy.firstName', ' ', '$createdBy.lastName'],
        },
      },
    },
    {
      $lookup: {
        from: 'collectiongroups',
        localField: '_id',
        foreignField: 'collectionId',
        as: 'groupMembers',
      },
    },
    {
      $lookup: {
        from: 'collectionprocesses',
        localField: '_id',
        foreignField: 'collectionId',
        as: 'processMembers',
        pipeline: [
          {
            $lookup: {
              from: 'processes',
              localField: 'processId',
              foreignField: '_id',
              as: 'process',
              pipeline: [...matchDocumentTypeIds, ...matchTagIds],
            },
          },
          {
            $unwind: {
              path: '$process',
            },
          },
        ],
      },
    },
  ];

  if (isBasicUser) {
    pipeline.push({
      $match: {
        $or: [
          {
            'groupMembers.groupId': {
              $in: groupIdsOfBasicUser.map((x) =>
                ObjectId.isValid(x) ? new ObjectId(x) : ''
              ),
            },
          },
          {
            _id: {
              $in: collectionIds.map((x) =>
                ObjectId.isValid(x) ? new ObjectId(x) : ''
              ),
            },
          },
        ],
      },
    });
  }

  if (processIds && processIds?.length > 0) {
    pipeline.push({
      $match: {
        'processMembers.processId': {
          $in: processIds.map((x) =>
            ObjectId.isValid(x) ? new ObjectId(x) : ''
          ),
        },
      },
    });
  }

  if (groupIds && groupIds?.length > 0) {
    pipeline.push({
      $match: {
        'groupMembers.groupId': {
          $in: groupIds.map((x) =>
            ObjectId.isValid(x) ? new ObjectId(x) : ''
          ),
        },
      },
    });
  }

  if (documentTypeIds && documentTypeIds?.length > 0) {
    pipeline.push({
      $match: {
        'processMembers.process.documentTypeId': {
          $in: documentTypeIds.map((x) =>
            ObjectId.isValid(x) ? new ObjectId(x) : ''
          ),
        },
      },
    });
  }

  if (modifiedDate && modifiedDate?.length > 0) {
    const [startDate, endDate] = modifiedDate;
    pipeline.push({
      $match: {
        updatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    });
  }

  const paginatedResults = [];
  if (skip) {
    paginatedResults.push({
      $skip: skip,
    });
  }
  if (limit) {
    paginatedResults.push({
      $limit: limit,
    });
  }

  const dataPipeline = [
    {
      $sort:
        sortBy === CollectionSortByEnum.NAME
          ? { name: 1 }
          : sortBy === CollectionSortByEnum.NEWEST
          ? { createdAt: -1 }
          : { updatedAt: -1 },
    },
    {
      $project: {
        _id: false,
        id: '$_id',
        name: true,
        createdAt: true,
        updatedAt: true,
        mainMedia: true,
        overview: true,
        public: true,
        archivedAt: true,
        organizationId: true,
        collectionsProcesses: true,
        organization: true,
        groups: true,
        groupIds: '$groupMembers.groupId',
        isVisible: true,
        createdBy: '$fullName',
      },
    },
    {
      $facet: {
        paginatedResults,
        totalResults: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ];

  return [...pipeline, ...dataPipeline];
}

export { getCollectionsByFilterPipeline };
