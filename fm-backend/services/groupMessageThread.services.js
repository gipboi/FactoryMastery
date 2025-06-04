import createError from 'http-errors';
import GroupMessageThread from '../schemas/groupMessageThread.schema.js';
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from '../utils/index.js';
import GroupMessage from '../schemas/groupMessage.schema.js';
import GroupMessageThreadUserSeen from '../schemas/groupMessageThreadUserSeen.schema.js';
import { getGeneralMessageThreadPipeline } from '../utils/message.js';
import { UserSeenService } from './user-seen.services.js';

export class GroupMessageThreadService {
  constructor() {
    this.userSeenService = new UserSeenService();
  }

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

      const dataPromise = GroupMessageThread.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, 'Get GroupMessageThreads Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'get'
      );
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await GroupMessageThread.aggregate(pipeline);

      successHandler(res, data, 'Get GroupMessageThreads Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'getByAggregation'
      );
    }
  }

  async create(req, res, next) {
    try {
      let groupMessageThreadData = req?.body;
      const currentUserId = req?.auth?._id;
      groupMessageThreadData = await this.validateGroupMessageThread(
        groupMessageThreadData
      );

      const newThread = await GroupMessageThread.create({
        name: groupMessageThreadData.name,
        organizationId: groupMessageThreadData.organizationId,
        isPrivate: groupMessageThreadData?.isPrivate ?? false,
      });
      const threadId = newThread?.id;

      await GroupMessage.create({
        content: groupMessageThreadData.content,
        attachments: groupMessageThreadData.attachments,
        groupThreadId: threadId,
        userId: currentUserId,
        receiverId: groupMessageThreadData.receiverId,
      });

      await Promise.all([
        GroupMessageThreadUserSeen.create({
          userId: groupMessageThreadData.userId,
          groupThreadId: threadId,
          lastSeenAt: new Date(),
        }),
        GroupMessageThreadUserSeen.create({
          userId: groupMessageThreadData?.receiverId,
          groupThreadId: threadId,
          lastSeenAt: new Date(),
        }),
      ]);

      await GroupMessageThread.updateOne(
        {
          _id: newThread?.id,
        },
        { lastMessageAt: new Date() }
      );

      successHandler(res, newThread, 'Create GroupMessageThread Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'create'
      );
    }
  }

  async findById(req, res, next) {
    try {
      const { groupMessageThreadId } = req.params;
      const userId = req?.auth?._id;
      const filter = JSON.parse(req.query.filter || '{}');

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const seenData = await GroupMessageThreadUserSeen.find({
        groupThreadId: groupMessageThreadId,
        userId,
      });

      if (seenData.length) {
        const seenId = seenData.shift()?.id;
        await GroupMessageThreadUserSeen.updateOne(
          {
            _id: seenId,
          },
          {
            lastSeenAt: new Date(),
          }
        );
      } else if (userId && groupMessageThreadId) {
        await GroupMessageThreadUserSeen.create({
          userId,
          groupThreadId: groupMessageThreadId,
          lastSeenAt: new Date(),
        });
      }
      const data = await GroupMessageThread.findOne({
        _id: groupMessageThreadId,
      }).populate(populateOptions);

      successHandler(
        res,
        data?.groupMessages,
        'Get GroupMessageThread Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'findById'
      );
    }
  }

  async updateById(req, res, next) {
    try {
      const { groupMessageThreadId } = req.params;
      let groupMessageThreadData = req?.body;

      const currentGroupMessageThread = await GroupMessageThread.findOne({
        _id: groupMessageThreadId,
      });

      if (!currentGroupMessageThread) {
        throw createError(404, 'GroupMessageThread not found');
      }

      const updatedGroupMessageThread =
        await GroupMessageThread.findOneAndUpdate(
          {
            _id: groupMessageThreadId,
          },
          groupMessageThreadData
        );

      successHandler(
        res,
        updatedGroupMessageThread,
        'Update GroupMessageThread Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'updateById'
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { groupMessageThreadId } = req.params;
      await GroupMessageThread.deleteOne({
        _id: groupMessageThreadId,
      });

      successHandler(res, {}, 'Delete GroupMessageThread Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'deleteById'
      );
    }
  }

  async getGeneralMessages(req, res, next) {
    try {
      const { limit, keyword } = req?.query;
      const currentUserId = req?.auth?._id;

      const pipeline = getGeneralMessageThreadPipeline(
        currentUserId,
        limit,
        keyword
      );
      const results = await GroupMessageThread.aggregate(pipeline);

      successHandler(res, results, 'Delete GroupMessageThread Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'getGeneralMessages'
      );
    }
  }

  async createGroupMessage(req, res, next) {
    try {
      const { groupMessageThreadId } = req.params;
      const groupMessage = req.body;

      await GroupMessageThread.updateOne(
        {
          _id: groupMessageThreadId,
        },
        { lastMessageAt: new Date() }
      );
      await this.userSeenService.updateUserSeenTime(
        groupMessageThreadId,
        groupMessage.userId
      );
      const newGroupMessage = GroupMessage.create({
        ...groupMessage,
        groupThreadId: groupMessageThreadId,
      })

      successHandler(res, newGroupMessage, 'Create GroupMessageThread Successfully');
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThread.services.js',
        'createGroupMessage'
      );
    }
  }

  async validateGroupMessageThread(data) {
    if (!data?.organizationId) {
      throw createError(400, 'Organization Id is required');
    }

    return data;
  }

  async validateExistGroupMessageThread(id) {
    const foundGroupMessageThread = await GroupMessageThread.findOne({
      _id: id,
    });

    if (foundGroupMessageThread) {
      throw createError(403, 'GroupMessageThread already exist');
    }
  }
}
