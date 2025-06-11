import mongoose from 'mongoose';
import createError from 'http-errors';
// *INFO: Do not remove this line
import UserCollection from '../schemas/userCollection.schema.js';
import CollectionProcess from '../schemas/collectionProcess.schema.js';
import CollectionGroup from '../schemas/collectionGroup.schema.js';

import User from '../schemas/user.schema.js';
import Collection from '../schemas/collection.schema.js';
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
} from '../utils/index.js';
import { getCollectionsByFilterPipeline } from '../utils/collection.js';
import { AuthRoleEnum } from '../constants/enums/auth-role.enum.js';
import lodashGet from 'lodash/get';
import GroupMember from '../schemas/groupMember.schema.js';
import { trim } from 'lodash';

const ObjectId = mongoose.Types.ObjectId;

export class CollectionService {
  constructor() {}

  async get(req, res, next) {
    try {
      let filter = req?.query?.filter || {};
      const userProfile = req?.auth;
      if (typeof filter === 'string') {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }
      let data;

      if (filter?.groups) {
        data = await this.findByGroup(filter, userProfile);
      } else {
        const dataPromise = Collection.find(filter?.where);

        if (filter?.offset) {
          dataPromise.skip(filter?.offset);
        }
        if (filter?.limit) {
          dataPromise.limit(filter?.limit);
        }
        data = await dataPromise.populate(populateOptions);
      }

      successHandler(res, data, 'Get Collections Successfully');
    } catch (error) {
      handleError(next, error, 'services/collection.services.js', 'get');
    }
  }

  async findByGroup(customFilter, currentUserProfile) {
    const { where, groups, limit, offset, fields, order } = customFilter;
    const filteredGroups = groups;
    let groupIdsOfBasicUser = [];
    if (currentUserProfile.authRole === AuthRoleEnum.BASIC_USER) {
      const groupMembers = await GroupMember.find({
        userId: currentUserProfile.id,
      });
      groupIdsOfBasicUser = getValidArray(groupMembers).map(
        (groupMember) => groupMember.groupId
      );
    }

    const isAdmin = [AuthRoleEnum.MANAGER, AuthRoleEnum.ORG_ADMIN].includes(
      currentUserProfile.authRole
    );
    const onlyGetGroupOfBasicUser = [
      {
        $lookup: {
          from: 'collectiongroups',
          localField: '_id',
          foreignField: 'collectionId',
          as: 'collectionGroup',
        },
      },
      {
        $unwind: {
          path: '$collectionGroup',
        },
      },
      {
        $match: {
          'collectionGroup.groupId': {
            $in: getValidArray(groupIdsOfBasicUser).map(
              (id) => new ObjectId(id)
            ),
          },
        },
      },
    ];

    const filterGroupPipeline = [
      {
        $lookup: {
          from: 'collectiongroups',
          localField: '_id',
          foreignField: 'collectionId',
          as: 'collectionGroup',
        },
      },
      {
        $unwind: {
          path: '$collectionGroup',
        },
      },
      {
        $match: {
          'collectionGroup.groupId': {
            $in: getValidArray(filteredGroups).map((id) => new ObjectId(id)),
          },
        },
      },
    ];

    const groupPipeline = [
      {
        $group: {
          _id: '$_id',
          name: {
            $first: '$name',
          },
          organizationId: {
            $first: '$organizationId',
          },
          createdAt: {
            $first: '$createdAt',
          },
          updatedAt: {
            $first: '$updatedAt',
          },
          mainMedia: {
            $first: '$mainMedia',
          },
          overview: {
            $first: '$overview',
          },
          public: {
            $first: '$public',
          },
          archived: {
            $first: '$archived',
          },
          isVisible: {
            $first: '$isVisible',
          },
        },
      },
    ];

    const pipeline = [
      {
        $match: {
          ...where,
          name: {
            $regex: `.*${trim(lodashGet(where, 'name', ''))}.*`,
            $options: 'i',
          },
        },
      },
    ];

    if (!isAdmin) {
      pipeline.push(...onlyGetGroupOfBasicUser);
    }

    if (isAdmin && filteredGroups?.length) {
      pipeline.push(...filterGroupPipeline);
    }

    pipeline.push(...groupPipeline);

    const [countResponse] = await Collection.aggregate([
      ...pipeline,
      {
        $count: 'totalResults',
      },
    ]);

    pipeline.push(
      {
        $addFields: {
          id: '$_id',
        },
      },
      {
        $unset: '_id',
      }
    );

    if (fields) {
      pipeline.push({
        $project: fields,
      });
    }
    if (order) {
      const $sort = {};
      order.forEach((criteria) => {
        const [field, sortOrder] = criteria?.split(' ');
        $sort[field] = sortOrder?.toLowerCase() === 'asc' ? 1 : -1;
      });
      pipeline.push({
        $sort,
      });
    }
    if (offset) {
      pipeline.push({
        $skip: offset,
      });
    }
    if (limit) {
      pipeline.push({
        $limit: limit,
      });
    }

    const collections = await Collection.aggregate(pipeline);

    return {
      result: collections,
      totalCount: countResponse?.totalResults ?? 0,
    };
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Collection.aggregate(pipeline);

      successHandler(res, data, 'Get Collections Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/collection.services.js',
        'getByAggregation'
      );
    }
  }

  async create(req, res, next) {
    try {
      let collectionData = req?.body;
      const currentUserId = req?.auth?._id;
      collectionData = await this.validateCollection(collectionData);

      const createdCollection = await Collection.create({
        ...collectionData,
        createdById: currentUserId,
      });

      if (
        Array.isArray(collectionData?.processIds) &&
        collectionData?.processIds?.length > 0
      ) {
        await Promise.all(
          getValidArray(collectionData?.processIds).map((processId) =>
            CollectionProcess.create({
              collectionId: createdCollection.id,
              processId,
            })
          )
        );
      }

      if (
        Array.isArray(collectionData?.groupIds) &&
        collectionData?.groupIds?.length > 0
      ) {
        await Promise.all(
          getValidArray(collectionData?.groupIds).map((groupId) =>
            CollectionGroup.create({
              collectionId: createdCollection.id,
              groupId,
            })
          )
        );
      }

      successHandler(res, createdCollection, 'Create Collection Successfully');
    } catch (error) {
      handleError(next, error, 'services/collection.services.js', 'create');
    }
  }

  async findById(req, res, next) {
    try {
      const { collectionId } = req.params;
      let filter = req?.query?.filter || {};
      if (typeof filter === 'string') {
        filter = JSON.parse(filter);
      }
      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }
      const currentCollection = JSON.parse(
        JSON.stringify(
          await Collection.findOne({
            _id: collectionId,
            ...filter.where,
          }).populate(populateOptions)
        )
      );

      successHandler(res, currentCollection, 'Get Collection Successfully');
    } catch (error) {
      handleError(next, error, 'services/collection.services.js', 'findById');
    }
  }

  async updateById(req, res, next) {
    try {
      const { collectionId } = req.params;
      let collectionData = req?.body;
      const { groupIds, processIds, userIds } = collectionData;

      const currentCollection = await Collection.findOne({ _id: collectionId });

      if (!currentCollection) {
        throw createError(404, 'Collection not found');
      }

      await Promise.all([
        groupIds && CollectionGroup.deleteMany({ collectionId }),
        processIds && CollectionProcess.deleteMany({ collectionId }),
        userIds && UserCollection.deleteMany({ collectionId }),
      ]);

      await Promise.all([
        getValidArray(groupIds).map((groupId) =>
          CollectionGroup.create({ collectionId, groupId })
        ),
        getValidArray(processIds).map((processId) =>
          CollectionProcess.create({ collectionId, processId })
        ),
        getValidArray(userIds).map((userId) =>
          UserCollection.create({ collectionId, userId })
        ),
      ]);

      const updatedCollection = await Collection.findOneAndUpdate(
        {
          _id: collectionId,
        },
        collectionData,
        { new: true }
      );

      successHandler(res, updatedCollection, 'Update Collection Successfully');
    } catch (error) {
      handleError(next, error, 'services/collection.services.js', 'updateById');
    }
  }

  async deleteById(req, res, next) {
    try {
      const { collectionId } = req.params;
      await Collection.deleteOne({
        _id: collectionId,
      });

      successHandler(res, {}, 'Delete Collection Successfully');
    } catch (error) {
      handleError(next, error, 'services/collection.services.js', 'deleteById');
    }
  }

  async getCollectionsByFilter(req, res, next) {
    try {
      const filter = req.body;

      const user = await User.findOne({ _id: filter?.userId })
        .populate('groupMembers')
        .populate('userCollections');

      const isBasicUser = user?.authRole === AuthRoleEnum.BASIC_USER;
      const groupIdsOfBasicUser = getValidArray(user?.groupMembers).map(
        (groupMember) => groupMember?.groupId
      );
      const collectionIds = getValidArray(user?.userCollections).map(
        (userCollection) => userCollection?.collectionId
      );

      const pipeline = getCollectionsByFilterPipeline(
        filter,
        isBasicUser,
        groupIdsOfBasicUser,
        collectionIds
      );

      const result = await Collection.aggregate(pipeline, { maxTimeMS: 30000 });

      successHandler(
        res,
        {
          paginatedResults: result?.[0]?.paginatedResults,
          totalResults: lodashGet(result, '[0].totalResults[0].count', 0),
        },
        'Get Collection by filter Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/collection.services.js',
        'getCollectionsByFilter'
      );
    }
  }

  async shareToGroups(req, res, next) {
    try {
      const { collectionIds, groupIds } = req.body;

      const existingShares = await CollectionGroup.find({
        collectionId: { $in: collectionIds },
        groupId: { $in: groupIds },
      });

      const existingGroupIds = getValidArray(existingShares).map(
        (share) => share.groupId
      );
      const newGroupIds = getValidArray(groupIds).filter(
        (groupId) => !existingGroupIds.includes(groupId)
      );

      if (newGroupIds.length) {
        const listNewGroupCollection = [];
        getValidArray(newGroupIds).forEach((groupId) => {
          listNewGroupCollection.push(
            ...getValidArray(collectionIds).map((collectionId) =>
              CollectionGroup.create({
                collectionId,
                groupId,
              })
            )
          );
        });

        await Promise.all(listNewGroupCollection);
      }

      successHandler(res, {}, 'Share collection to groups Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/collection.services.js',
        'shareToGroups'
      );
    }
  }

  async archiveCollection(req, res, next) {
    try {
      const { collectionId } = req.params;

      await Collection.updateOne(
        {
          _id: collectionId,
        },
        { archivedAt: Date.now() }
      );

      successHandler(res, {}, 'Archive collection Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/collection.services.js',
        'archiveCollection'
      );
    }
  }

  async batchCollectionProcess(req, res, next) {
    try {
      const { collectionIds, processId } = req?.body;

      await CollectionProcess.deleteMany({
        processId: processId,
      });

      await Promise.all(
        getValidArray(collectionIds).map((collectionId) =>
          CollectionProcess.create({
            collectionId,
            processId,
          })
        )
      );

      successHandler(res, {}, 'Update collections of Process Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/collection.services.js',
        'batchCollectionProcess'
      );
    }
  }

  async validateCollection(data) {
    if (!data?.organizationId) {
      throw createError(400, 'Organization Id is required');
    }

    return data;
  }

  async validateExistCollection(id) {
    const foundCollection = await Collection.findOne({
      _id: id,
    });

    if (foundCollection) {
      throw createError(403, 'Collection already exist');
    }
  }
}
