import createError from 'http-errors';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import Group from '../schemas/group.schema.js';
import GroupMember from '../schemas/groupMember.schema.js';
import GroupProcess from '../schemas/groupProcess.schema.js';
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
  toCaseInsensitive,
} from '../utils/index.js';

const ObjectId = mongoose.Types.ObjectId;

export class GroupService {
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

      const dataPromise = Group.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, 'Get Groups Successfully');
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'get');
    }
  }

  async getGroupsByAggregate(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Group.aggregate(pipeline);

      successHandler(res, data, 'Get Group Successfully');
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'create');
    }
  }

  async create(req, res, next) {
    try {
      let groupData = req?.body;
      groupData = await this.validateGroup(groupData);

      const createdGroup = await Group.create(groupData);

      successHandler(res, createdGroup, 'Create Group Successfully');
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'create');
    }
  }

  async findById(req, res, next) {
    try {
      const { groupId } = req.params;

      const group = await Group.findOne({
        _id: groupId,
      });

      successHandler(res, group, 'Update Group Successfully');
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'findById');
    }
  }

  async updateById(req, res, next) {
    try {
      const { groupId } = req.params;
      let groupData = req?.body;

      const currentGroup = await Group.findOne({
        _id: groupId,
      });

      if (!currentGroup) {
        throw createError(404, 'Group not found');
      }

      if (groupData?.name && groupData?.name !== currentGroup.name) {
        await this.validateExistGroup(groupData?.name);
      }

      const updatedGroup = await Group.findOneAndUpdate(
        {
          _id: groupId,
        },
        groupData,
        { new: true }
      );

      successHandler(
        res,
        {
          ...updatedGroup,
          ...groupData,
        },
        'Update Group Successfully'
      );
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'updateById');
    }
  }

  async deleteById(req, res, next) {
    try {
      const { groupId } = req.params;
      await Promise.all([
        Group.deleteOne({
          _id: groupId,
        }),
        GroupMember.deleteMany({
          groupId,
        })
      ]);

      successHandler(res, {}, 'Delete Group Successfully');
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'deleteById');
    }
  }

  async duplicateGroup(req, res, next) {
    const { groupId } = req.params;
    const { organizationId } = req.auth;
    let groupData = req?.body;

    const {
      name,
      description,
      isDuplicateMember,
      isDuplicateProcessAndCollection,
    } = groupData;
    const newGroup = await Group.create({
      name,
      description,
      organizationId,
    });

    const duplicateGroupData = (sourceData) => {
      return sourceData?.map((data) => {
        const filteredData = omit(data, [
          '_id',
          'id',
          'createdAt',
          'updatedAt',
        ]);
        return {
          ...filteredData,
          groupId: newGroup.id,
        };
      });
    };

    try {
      if (isDuplicateMember) {
        const allExistingMembersOfSourceGroup = await GroupMember.find({
          groupId,
        });
        const duplicatedMembersData = duplicateGroupData(
          allExistingMembersOfSourceGroup
        );
        await GroupMember.insertMany(duplicatedMembersData);
      }

      if (isDuplicateProcessAndCollection) {
        const allProcessesOfSourceGroup = await GroupProcess.find({
          groupId,
        });
        // const allCollectionOfSourceGroup =
        //   await CollectionGroup.find({
        //     where: { groupId },
        //   });

        const duplicatedProcessesData = duplicateGroupData(
          allProcessesOfSourceGroup
        );
        // const duplicatedCollectionsData = duplicateGroupData(
        //   allCollectionOfSourceGroup
        // );

        await Promise.all([
          GroupProcess.insertMany(duplicatedProcessesData),
          // CollectionGroup.insertMany(duplicatedCollectionsData),
        ]);
      }

      successHandler(res, newGroup, 'Create Group Successfully');
    } catch (error) {
      await Promise.all([
        Group.findByIdAndDelete(newGroup.id),
        GroupProcess.deleteMany({ groupId: newGroup.id }),
        // CollectionGroup.deleteMany({ groupId: newGroup.id }),
      ]);

      handleError(next, error, 'services/group.services.js', 'create');
    }
  }

  async validateGroup(data) {
    if (!data?.organizationId) {
      throw createError(400, 'Organization Id is required');
    }

    if (!data?.name) {
      throw createError(400, 'Group name is required');
    }

    // await this.validateExistGroup(data?.name);

    return data;
  }

  async countMember(req, res, next) {
    try {
      const { groupId } = req.params;

      const pipeline = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            groupId: new ObjectId(groupId),
            'user.isInactive': { $ne: true },
          },
        },
        {
          $group: {
            _id: '$userId',
          },
        },
        {
          $count: 'id',
        },
        {
          $project: {
            numberOfMembers: '$id',
          },
        },
      ];

      const result = await GroupMember.aggregate(pipeline);

      let count = 0;
      if (getValidArray(result).length === 0) {
        count = 0;
      }
      count = result?.[0]?.numberOfMembers ?? 0;

      successHandler(res, count, 'Count members Successfully');
    } catch (error) {
      handleError(next, error, 'services/group.services.js', 'countMember');
    }
  }

  async validateExistGroup(name) {
    const foundGroup = await Group.findOne({
      name: toCaseInsensitive(name),
    });

    if (foundGroup) {
      throw createError(403, 'Group name already exist');
    }
  }
}
