import { isEmpty } from "lodash";
import { AggregationPipeline } from "types/common/aggregation";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import { ESortingUserOptions } from "constants/enums/user";
import { generateMatchObjectIdsQuery, getValidArray } from "utils/common";

export function getUsersFilterPipeline(
  organizationId: string,
  limit: number,
  skip: number,
  keyword: string,
  isViewer?: boolean,
  sortBy?: string,
  roleIds?: string[],
  groupIds?: string[]
): AggregationPipeline {
  let sort: any = {
    updatedAt: -1,
  };
  if (sortBy) {
    switch (sortBy) {
      case ESortingUserOptions.NAME:
        sort = {
          firstName: 1,
          lastName: 1,
        };
        break;
      case ESortingUserOptions.NEWEST:
        sort = {
          updatedAt: -1,
        };
        break;
      case ESortingUserOptions.LAST_LOGIN:
        sort = {
          lastSignInAt: -1,
        };
        break;
    }
  }

  const pipeline: AggregationPipeline = [
    {
      $addFields: {
        fullName: {
          $concat: ["$firstName", " ", "$lastName"],
        },
      },
    },
    {
      $match: {
        $or: [
          { firstName: { $regex: `.*${keyword}.*`, $options: "i" } },
          { lastName: { $regex: `.*${keyword}.*`, $options: "i" } },
          { email: { $regex: `.*${keyword}.*`, $options: "i" } },
          { username: { $regex: `.*${keyword}.*`, $options: "i" } },
          { fullName: { $regex: `.*${keyword}.*`, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "groupmembers",
        localField: "_id",
        foreignField: "userId",
        as: "groupMembers",
      },
    },
    {
      $lookup: {
        from: "groups",
        localField: "groupMembers.groupId",
        foreignField: "_id",
        as: "groups",
      },
    },
  ];

  if (isViewer) {
    pipeline.unshift({
      $match: {
        authRole: {
          $ne: AuthRoleNameEnum.BASIC_USER,
        },
      },
    });
  }

  if (!isEmpty(roleIds)) {
    pipeline.push({
      $match: {
        authRole: {
          $in: roleIds,
        },
      },
    });
  }

  if (!isEmpty(groupIds)) {
    pipeline.push(
      generateMatchObjectIdsQuery(
        "groupMembers",
        "groupId",
        getValidArray(groupIds)
      )
    );
  }

  pipeline.unshift({
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
  });

  const paginationPipeline: AggregationPipeline = [
    {
      $sort: sort,
    },
    {
      $facet: {
        results: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
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
        totalCount: [
          {
            $count: "total",
          },
        ],
      },
    },
  ];
  pipeline.push(...paginationPipeline);

  return pipeline;
}
