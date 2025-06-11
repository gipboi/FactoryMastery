import createError from "http-errors";
import GroupMember from "../schemas/groupMember.schema.js";
import { getValidArray, handleError, successHandler } from "../utils/index.js";

export class GroupMemberService {
  constructor() {}

  async addGroupMembers(req, res, next) {
    try {
      const body = req?.body || {};

      const {
        userIds = 0,
        toRemoveGroupIds = [],
        toCreateGroupMembers = [],
      } = body;

      if (
        getValidArray(userIds).length > 0 &&
        getValidArray(toRemoveGroupIds).length > 0
      ) {
        await GroupMember.deleteMany({
          userId: { $in: userIds },
          groupId: { $in: toRemoveGroupIds },
        });
      }
      const newGroupMembers = await this.createAll(toCreateGroupMembers);

      successHandler(res, newGroupMembers, "Assign group member Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-member.services.js",
        "addGroupMembers"
      );
    }
  }

  async get(req, res, next) {
    try {
      const params = req?.query || {};

      const data = await GroupMember.find(params?.where);

      successHandler(res, data, "Get GroupMembers Successfully");
    } catch (error) {
      handleError(next, error, "services/groupMember.services.js", "get");
    }
  }

  async getGroupMembersByAggregate(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await GroupMember.aggregate(pipeline);

      successHandler(res, data, "Get GroupMember Successfully");
    } catch (error) {
      handleError(next, error, "services/groupMember.services.js", "create");
    }
  }

  async create(req, res, next) {
    try {
      let groupData = req?.body;
      groupData = await this.validateGroupMember(groupData);

      const createdGroupMember = await GroupMember.create(groupData);

      successHandler(
        res,
        createdGroupMember,
        "Create GroupMember Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/groupMember.services.js", "create");
    }
  }

  async createAll(groupMembers) {
    try {
      const newGroupMembers = [];

      getValidArray(groupMembers).forEach(async (groupMember) => {
        const existedGroupMember = await GroupMember.findOne({
          groupId: groupMember.groupId,
          userId: groupMember.userId,
        });
        if (!existedGroupMember) {
          const newGroupMember = await GroupMember.create(groupMember);
          newGroupMembers.push(newGroupMember);
        } else {
          await GroupMember.findOneAndUpdate(
            {
              _id: existedGroupMember.id,
            },
            groupMember,
            { new: true }
          );
        }
      });

      return newGroupMembers;
    } catch (error) {
      handleError(next, error, "services/groupMember.services.js", "createAll");
    }
  }

  async updateById(req, res, next) {
    try {
      const { groupMemberId } = req.params;
      let groupData = req?.body;

      const currentGroupMember = await GroupMember.findOne({
        _id: groupMemberId,
      });

      if (!currentGroupMember) {
        throw createError(404, "GroupMember not found");
      }

      if (groupData?.name && groupData?.name !== currentGroupMember.name) {
        await this.validateExistGroupMember(groupData?.name);
      }

      const updatedGroupMember = await GroupMember.findOneAndUpdate(
        {
          _id: groupMemberId,
        },
        groupData,
        { new: true }
      );

      successHandler(
        res,
        updatedGroupMember,
        "Update GroupMember Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/groupMember.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { groupMemberId } = req.params;
      await GroupMember.deleteOne({
        _id: groupMemberId,
      });

      successHandler(res, {}, "Delete GroupMember Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/groupMember.services.js",
        "deleteById"
      );
    }
  }

  async validateGroupMember(data) {
    await this.validateExistGroupMember(data?.userId, data?.groupId);

    return data;
  }

  async validateExistGroupMember(userId, groupId) {
    const foundGroup = await GroupMember.findOne({
      userId,
      groupId,
    });

    if (foundGroup) {
      throw createError(403, "Group name already exist");
    }
  }
}
