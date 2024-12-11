import path from "path";
import { AggregationPipeline } from "types/common/aggregation";

export enum ETableHeader {
  CHECKBOX = "checkbox",
  NAME = "name",
  EMAIL = "email",
  PERMISSION = "permission",
  LOGIN = "lastSignInAt",
  ACTIONS = "actions",
}

export function getGroupMemberAggregation(
  keyword: string,
  organizationId: string,
  skip?: number,
  limit?: number,
  groupId?: string,
  userId?: string
): AggregationPipeline {
  const filterUser = userId
    ? {
        $expr: {
          $eq: ["$userId", { $toObjectId: userId }],
        },
      }
    : {};
  const filterGroup = groupId
    ? {
        $expr: {
          $eq: ["$groupId", { $toObjectId: groupId }],
        },
      }
    : {};
  const skipFilter = skip
    ? [
        {
          $skip: skip ?? 0,
        },
      ]
    : [];
  const limitFilter = limit
    ? [
        {
          $limit: limit ?? 20,
        },
      ]
    : [];

  return [
    {
      $match: {
        ...filterUser,
        ...filterGroup,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        pipeline: [
          {
            $addFields: {
              fullName: {
                $concat: ["$firstName", " ", "$lastName"],
              },
            },
          },
          {
            $match: {
              isInactive: { $ne: true },
              disabled: { $ne: true },
              $or: [
                { firstName: { $regex: `.*${keyword}.*`, $options: "i" } },
                { lastName: { $regex: `.*${keyword}.*`, $options: "i" } },
                { email: { $regex: `.*${keyword}.*`, $options: "i" } },
                { username: { $regex: `.*${keyword}.*`, $options: "i" } },
                { fullName: { $regex: `.*${keyword}.*`, $options: "i" } },
              ],
              $expr: {
                $eq: [
                  "$organizationId",
                  {
                    $toObjectId: organizationId,
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: false,
              id: "$_id",
              createdAt: true,
              updatedAt: true,
              encryptedPassword: true,
              lastSignInAt: true,
              firstName: true,
              lastName: true,
              username: true,
              image: true,
              email: true,
              isInactive: true,
              disabled: true,
              organizationId: true,
              groupMembers: true,
              groups: true,
              authRole: true,
            },
          },
        ],
        as: "member",
      },
    },
    {
      $unwind: {
        path: "$member",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "groupId",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  "$organizationId",
                  {
                    $toObjectId: organizationId,
                  },
                ],
              },
            },
          },
        ],
        as: "group",
      },
    },
    {
      $unwind: {
        path: "$group",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        member: { $ne: null },
        group: { $ne: null },
      },
    },
    {
      $facet: {
        paginatedResults: [
          ...skipFilter,
          ...limitFilter,
          {
            $project: {
              _id: false,
              id: "$_id",
              createdAt: true,
              updatedAt: true,
              permission: true,
              group: true,
              member: true,
              groupId: true,
              userId: true,
            },
          },
        ],
        totalCount: [
          {
            $count: "total",
          },
        ],
      },
    },
  ];
}
