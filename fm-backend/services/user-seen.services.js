import createError from 'http-errors';
import mongoose from 'mongoose';
import GroupMessageThreadUserSeen from '../schemas/groupMessageThreadUserSeen.schema.js';

const ObjectId = mongoose.Types.ObjectId;

export class UserSeenService {
  constructor() {}

  async updateUserSeenTime(groupThreadId, userId) {
    const seenData = await GroupMessageThreadUserSeen.find({
      groupThreadId,
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
    }
  }
}
