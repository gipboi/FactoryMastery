import trim from "lodash/trim";
import mongoose from 'mongoose';
import { GroupMemberPermissionEnum } from "../constants/enums/user-group-permission.enum";
const ObjectId = mongoose.Types.ObjectId;

export function getGeneralMessageThreadPipeline(currentUserId, limit, keyword) {
  return [
    {
      $lookup: {
        from: "groupmessages",
        localField: "_id",
        foreignField: "groupThreadId",
        as: "groupMessages",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    id: "$_id",
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    email: 1,
                    image: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "receiverId",
              foreignField: "_id",
              as: "receiver",
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    id: "$_id",
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    email: 1,
                    image: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: '$receiver',
              preserveNullAndEmptyArrays: true
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "groupmessagethreaduserseens",
        localField: "_id",
        foreignField: "groupThreadId",
        as: "groupMessageThreadUserSeens"
      }
    },
    {
      $match: {
        $and: [
          {
            $or: [
              { 'groupMessages.userId': new ObjectId(currentUserId) },
              { 'groupMessages.receiverId': new ObjectId(currentUserId) }
            ]
          },
          {
            $or: [
              { 'groupMessages.user.firstName': { $regex: trim(keyword), $options: 'i' } },
              { 'groupMessages.user.lastName': { $regex: trim(keyword), $options: 'i' } },
              { 'groupMessages.user.userName': { $regex: trim(keyword), $options: 'i' } },
              { 'groupMessages.receiver.firstName': { $regex: trim(keyword), $options: 'i' } },
              { 'groupMessages.receiver.lastName': { $regex: trim(keyword), $options: 'i' } },
              { 'groupMessages.receiver.userName': { $regex: trim(keyword), $options: 'i' } }
            ]
          }
        ]
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $limit: Number(limit)
    },
    {
      $addFields: {
        id: "$_id"
      }
    }
  ]
}

export const getAdminFromGroupsPipeline = (processId) => {
  const pipeline = [
    {
      $match: {
        _id: new ObjectId(processId)
      }
    },
    {
      $lookup: {
        from: 'groupprocesses',
        localField: '_id',
        foreignField: 'processId',
        as: 'groupProcesses'
      }
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'groupProcesses.groupId',
        foreignField: '_id',
        as: 'groups'
      }
    },
    {
      $unwind: {
        path: '$groups'
      }
    },
    {
      $project: {
        _id: false,
        group: '$groups',
        processId: '$_id'
      }
    },
    {
      $lookup: {
        from: 'groupmembers',
        localField: 'group._id',
        foreignField: 'groupId',
        as: 'groupMembers'
      }
    },
    {
      $unwind: {
        path: '$groupMembers'
      }
    },
    {
      $match: {
        'groupMembers.permission': GroupMemberPermissionEnum.EDITOR,
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'groupMembers.userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $project: {
        id: '$user._id',
        email: '$user.email',
        username: '$user.username',
        image: '$user.image'
      }
    }
  ]
  return pipeline
}
