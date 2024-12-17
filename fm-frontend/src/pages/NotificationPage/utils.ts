import { NotificationTypeEnum } from "config/constant/enums/notification";
import { trim } from "lodash";
import { getUserDetailProjectPipeline } from "pages/ProcessPage/aggregate";
import { AggregationPipeline } from "types/common/aggregation";
import { ESortingUserOptions } from "./NotificationList/NotificationListFilterDialog/constants";
import { generateMatchObjectIdsQuery, getValidArray } from "utils/common";

export function getNotificationPipeline(
  userId: string,
  keyword: string,
  skip: number,
  limit: number,
  userIds: string[],
  sortBy: string,
  isCount: boolean = false
): AggregationPipeline {
  let sort = {
    createdAt: sortBy === ESortingUserOptions.OLDEST ? 1 : -1,
  };

  if (sortBy === ESortingUserOptions.UN_READ) {
    sort = {
      isSeen: 1,
      createdAt: -1,
    } as any;
  }

  const matchQuery = {
    $expr: {
      $and: [
        {
          $eq: ["$userId", { $toObjectId: userId }],
        },
      ],
    },
    $or: [
      { type: NotificationTypeEnum.COMMENT_STEP_NOTIFICATION },
      { type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION },
      { type: NotificationTypeEnum.DELETED_STEP_NOTIFICATION },
      { type: NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION },
      { type: NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION },
    ],
  };

  if (userIds.length > 0) {
    matchQuery.$expr.$and.push({
      $in: [
        "$createdBy",
        userIds.map((id) => ({ $toObjectId: id })), // Convert user IDs to ObjectId
      ],
    } as any);
  }

  const pipeline: AggregationPipeline = [
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: "processes",
        localField: "processId",
        foreignField: "_id",
        as: "process",
      },
    },
    {
      $unwind: {
        path: "$process",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [getUserDetailProjectPipeline],
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "steps",
        localField: "stepId",
        foreignField: "_id",
        as: "step",
      },
    },
    {
      $unwind: {
        path: "$step",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          {
            "author.name": {
              $regex: `.*${trim(keyword ?? "")}.*`,
              $options: "i",
            },
          },
          {
            "process.name": {
              $regex: `.*${trim(keyword ?? "")}.*`,
              $options: "i",
            },
          },
          {
            "step.name": {
              $regex: `.*${trim(keyword ?? "")}.*`,
              $options: "i",
            },
          },
        ],
      },
    },
    {
      $sort: sort,
    },
  ];

  if (!isCount) {
    pipeline.push(
      ...[
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]
    );
  } else {
    pipeline.push(
      ...[
        {
          $count: "totalResults",
        },
        {
          $project: {
            totalResults: 1,
          },
        },
      ]
    );
  }

  return pipeline;
}
