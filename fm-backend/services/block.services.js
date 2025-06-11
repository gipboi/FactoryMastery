import createError from "http-errors";
import Block from "../schemas/block.schema.js";
import BlockMedia from "../schemas/blockMedia.schema.js";
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
} from "../utils/index.js";
import {
  NotificationTitleEnum,
  NotificationTypeEnum,
} from "../constants/enums/notification.enum.js";
import { UserService } from "./user.services.js";
import Notification from "../schemas/notification.schema.js";

export class BlockService {
  userService;
  constructor() {
    this.userService = new UserService();
  }

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

      const dataPromise = Block.find(filter?.where);
      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }
      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get Blocks Successfully");
    } catch (error) {
      handleError(next, error, "services/block.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Block.aggregate(pipeline);

      successHandler(res, data, "Get Blocks Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/block.services.js",
        "getByAggregation"
      );
    }
  }

  async create(req, res, next) {
    try {
      let blockData = req?.body;
      const currentUserId = req?.auth?._id;
      blockData = await this.validateBlock(blockData);

      const createdBlock = await Block.create({
        ...blockData,
        createdBy: currentUserId,
      });

      successHandler(res, createdBlock, "Create Block Successfully");
    } catch (error) {
      handleError(next, error, "services/block.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { blockId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentBlock = await Block.findOne({
        _id: blockId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentBlock, "Get Block Successfully");
    } catch (error) {
      handleError(next, error, "services/block.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { blockId } = req.params;
      let blockData = req?.body;

      const currentBlock = await Block.findOne({
        _id: blockId,
      });

      if (!currentBlock) {
        throw createError(404, "Block not found");
      }

      const updatedBlock = await Block.findOneAndUpdate(
        {
          _id: blockId,
        },
        blockData,
        { new: true }
      ).populate("step");

      if (updatedBlock.stepId) {
        const processId = updatedBlock?.step?.[0]?.processId;
        const listRelatedUser =
          await this.userService.getListUserRelatedWithProcess(processId);

        Promise.all(
          getValidArray(listRelatedUser).map((user) => {
            return Notification.create({
              processId: processId,
              stepId: updatedBlock.stepId,
              organizationId: organizationId,
              type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
              title: NotificationTitleEnum.UPDATED_STEP_NOTIFICATION,
              userId: user,
              createdBy: _id,
              deletedName: process?.name || "",
            });
          })
        );
      }

      successHandler(res, updatedBlock, "Update Block Successfully");
    } catch (error) {
      handleError(next, error, "services/block.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { blockId } = req.params;
      const block = await Block.findOne({
        _id: blockId,
      }).populate("step");
      await Block.deleteOne({
        _id: blockId,
      });

      if (block.stepId) {
        const processId = block?.step?.[0]?.processId;
        const listRelatedUser =
          await this.userService.getListUserRelatedWithProcess(processId);

        Promise.all(
          getValidArray(listRelatedUser).map((user) => {
            return Notification.create({
              processId: processId,
              stepId: block.stepId,
              organizationId: organizationId,
              type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
              title: NotificationTitleEnum.UPDATED_STEP_NOTIFICATION,
              userId: user,
              createdBy: _id,
              deletedName: block?.name || "",
            });
          })
        );
      }

      successHandler(res, {}, "Delete Block Successfully");
    } catch (error) {
      handleError(next, error, "services/block.services.js", "deleteById");
    }
  }

  async upsertMedia(req, res, next) {
    try {
      const { blockId } = req.params;
      const mediaIds = req?.body;

      await BlockMedia.deleteMany({
        blockId,
      });

      const blockMedias = getValidArray(mediaIds).map((mediaId) => ({
        blockId,
        mediaId,
      }));

      await BlockMedia.create(blockMedias);

      successHandler(res, {}, "Upsert block media Successfully");
    } catch (error) {
      handleError(next, error, "services/block.services.js", "upsertMedia");
    }
  }

  async validateBlock(data) {
    if (!data?.stepId) {
      throw createError(400, "Step Id is required");
    }

    return data;
  }

  async validateExistBlock(id) {
    const foundBlock = await Block.findOne({
      _id: id,
    });

    if (foundBlock) {
      throw createError(403, "Block already exist");
    }
  }
}
