import createError from "http-errors";
import { difference } from "lodash";
import GroupMember from "../schemas/groupMember.schema.js";
import GroupProcess from "../schemas/groupProcess.schema.js";
import User from "../schemas/user.schema.js";
import UserProcess from "../schemas/userProcess.js";
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
} from "../utils/index.js";

export class GroupProcessService {
  constructor() {}

  async get(req, res, next) {
    try {
      let filter = req?.query?.filter || {};
      if (typeof filter === "string") {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const dataPromise = GroupProcess.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get GroupProcesses Successfully");
    } catch (error) {
      handleError(next, error, "services/group-process.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await GroupProcess.aggregate(pipeline);

      successHandler(res, data, "Get GroupProcesses Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-process.services.js",
        "getByAggregation"
      );
    }
  }

  async create(req, res, next) {
    try {
      let groupProcessData = req?.body;
      const currentUserId = req?.auth?._id;
      groupProcessData = await this.validateGroupProcess(groupProcessData);

      const createdGroupProcess = await GroupProcess.create({
        ...groupProcessData,
        createdBy: currentUserId,
      });

      successHandler(
        res,
        createdGroupProcess,
        "Create GroupProcess Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/group-process.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { groupProcessId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentGroupProcess = await GroupProcess.findOne({
        _id: groupProcessId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentGroupProcess, "Get GroupProcess Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-process.services.js",
        "findById"
      );
    }
  }

  async updateById(req, res, next) {
    try {
      const { groupProcessId } = req.params;
      let groupProcessData = req?.body;

      const currentGroupProcess = await GroupProcess.findOne({
        _id: groupProcessId,
      });

      if (!currentGroupProcess) {
        throw createError(404, "GroupProcess not found");
      }

      const updatedGroupProcess = await GroupProcess.findOneAndUpdate(
        {
          _id: groupProcessId,
        },
        groupProcessData
      );

      successHandler(
        res,
        updatedGroupProcess,
        "Update GroupProcess Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-process.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { groupProcessId } = req.params;
      await GroupProcess.deleteOne({
        _id: groupProcessId,
      });

      successHandler(res, {}, "Delete GroupProcess Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-process.services.js",
        "deleteById"
      );
    }
  }

  async shareProcessToGroups(req, res, next) {
    try {
      const { groupIds, processId } = req?.body;
      await this.shareProcessToGroupsHandler({ groupIds, processId }, true);

      successHandler(res, {}, "Share Process to Group Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-process.services.js",
        "shareProcessToGroups"
      );
    }
  }

  async shareProcessToGroupsHandler(data, isRemoveNeeded) {
    const { groupIds, processId } = data;
    const allSharedProcessGroups = await GroupProcess.find({ processId });
    const allSharedGroupIds = getValidArray(allSharedProcessGroups).map(
      (processGroup) => processGroup?.groupId
    );
    const addedGroupIds = difference(groupIds, allSharedGroupIds);
    const removedGroupIds = difference(allSharedGroupIds, groupIds);

    if (addedGroupIds?.length) {
      const newGroupProcesses = addedGroupIds.map((groupId) => ({
        groupId,
        processId,
      }));
      // *INFO: Handle unshared directly process
      const updateDirectlyUserProcessPromises = addedGroupIds.map(
        async (groupId) => {
          const members = await this.getMembersOfGroup(groupId);
          const memberIds = members.map((member) => member.id);
          return UserProcess.updateMany(
            { processId, userId: { $in: memberIds } },
            { isDirectlyShared: false }
          );
        }
      );
      await Promise.all(updateDirectlyUserProcessPromises);
      await GroupProcess.create(newGroupProcesses);
    }

    if (removedGroupIds?.length && isRemoveNeeded) {
      const removeSharedGroupPromises = removedGroupIds
        .map(async (removedGroupId) => {
          const [groupProcess, members] = await Promise.all([
            GroupProcess.findOne({
              groupId: removedGroupId,
              processId,
            }),
            this.getMembersOfGroup(removedGroupId),
          ]);
          if (groupProcess?.id) {
            const memberIds = members.map((member) => member.id);
            return Promise.all([
              GroupProcess.deleteOne({
                _id: groupProcess?.id,
              }),
              UserProcess.updateMany(
                { processId, userId: { $in: memberIds } },
                { isDirectlyShared: true }
              ),
            ]);
          }
          return undefined;
        })
        .filter(Boolean);
      await Promise.all(removeSharedGroupPromises);
    }
  }

  async getMembersOfGroup(groupId) {
    const groupMembers = await GroupMember.find({
      groupId,
    });
    const memberIds = groupMembers.map((groupMember) => groupMember.userId);
    const members = await User.find({
      _id: { $in: memberIds },
      isInactive: false,
    });

    return members;
  }

  async shareProcessesToGroups(req, res, next) {
    try {
      const { groupProcessId } = req.params;
      await GroupProcess.deleteOne({
        _id: groupProcessId,
      });

      successHandler(res, {}, "Share Processes to Group Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/group-process.services.js",
        "shareProcessesToGroups"
      );
    }
  }

  async validateGroupProcess(data) {
    if (!data?.groupId) {
      throw createError(400, "Group Id is required");
    }
    if (!data?.processId) {
      throw createError(400, "Process Id is required");
    }

    return data;
  }

  async validateExistGroupProcess(id) {
    const foundGroupProcess = await GroupProcess.findOne({
      _id: id,
    });

    if (foundGroupProcess) {
      throw createError(403, "GroupProcess already exist");
    }
  }
}
