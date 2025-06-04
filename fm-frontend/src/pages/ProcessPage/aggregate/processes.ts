/* eslint-disable max-lines */
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";
import trim from "lodash/trim";
import { AggregationPipeline } from "types/common/aggregation";
import { generateMatchObjectIdsQuery, getValidArray } from "utils/common";
import { getGroupFilterPipeline } from "./groupFilter";

/*
  INFO
    Process
    - Basic user : Can only see process in groups he belong to
    - Admin : Can see all
    Draft
    - Basic user & Admin : Only creator and collaborator can see
*/

export function getProcessPipeline(
  organizationId: string,
  limit: number,
  skip: number,
  collectionIds: string[],
  creatorIds: string[],
  documentTypeIds: string[],
  groupIds: string[],
  tagIds: string[],
  sortField: string,
  isCounting = false,
  isPublished: boolean | null = true,
  userId: string,
  userRole: AuthRoleNameEnum,
  isArchived?: boolean,
  keyword?: string,
  onlyGetProcessThatUserHaveEditPermission?: boolean
): AggregationPipeline {
  const filterCollectionPipeline: any = [];
  const filterTagDocumentTypeUserPipeline: any[] = [
    {
      $lookup: {
        from: "processtags",
        localField: "_id",
        foreignField: "processId",
        as: "processesTag",
      },
    },
  ];

  if (tagIds?.length > 0) {
    filterTagDocumentTypeUserPipeline.push(
      generateMatchObjectIdsQuery(
        "processesTag",
        "tagId",
        getValidArray(tagIds)
      )
    );
  }

  if (creatorIds?.length > 0) {
    filterTagDocumentTypeUserPipeline.push({
      $match: {
        $expr: {
          $in: [
            "$createdBy",
            getValidArray(creatorIds).map((id) => ({ $toObjectId: id })),
          ],
        },
      },
    });
  }

  if (documentTypeIds?.length > 0) {
    filterTagDocumentTypeUserPipeline.push({
      $match: {
        $expr: {
          $in: [
            "$documentTypeId",
            getValidArray(documentTypeIds).map((id) => ({ $toObjectId: id })),
          ],
        },
      },
    });
  }

  let match: Record<string, unknown> = {
    $expr: {
      $eq: [
        "$organizationId",
        {
          $toObjectId: organizationId,
        },
      ],
    },
    isDeleted: {
      $ne: true,
    },
    name: {
      $regex: `.*${trim(keyword ?? "")}.*`,
      $options: "i",
    },
    $or: [{ archivedAt: { $exists: false } }, { archivedAt: { $eq: null } }],
  };

  if (isArchived) {
    delete match["$or"];
    match.archivedAt = { $exists: true, $ne: null };
  }

  if (collectionIds?.length > 0) {
    filterCollectionPipeline.push({
      $lookup: {
        from: "collectionprocesses",
        localField: "_id",
        foreignField: "processId",
        as: "collectionsProcesses",
      },
    });

    filterCollectionPipeline.push(
      generateMatchObjectIdsQuery(
        "collectionsProcesses",
        "collectionId",
        getValidArray(collectionIds)
      )
    );
  }

  const isBasicUser = userRole === AuthRoleNameEnum.BASIC_USER;
  if (isBasicUser) {
    match["$or"] = [
      {
        "collaborators.userId": userId,
      },
      {
        currentMember: {
          $elemMatch: {
            permission: GroupMemberPermissionEnum.EDITOR,
          },
        },
      },
      {
        $expr: {
          $eq: [
            "$createdBy",
            {
              $toObjectId: userId,
            },
          ],
        },
      },
      {
        $expr: {
          $eq: [
            "$userProcesses.userId",
            {
              $toObjectId: userId,
            },
          ],
        },
      },
      getMatchGroupProcessOfUserPipeline(),
    ];
  }

  const groupProcessOnlyPipeline =
    isBasicUser && userId ? getProcessesInGroupOnly(userId) : [];

  const processPipeline: AggregationPipeline = [
    ...groupProcessOnlyPipeline,
    ...getUserProcessDirectly(userId),
    ...filterTagDocumentTypeUserPipeline,
    ...filterCollectionPipeline, // TODO check again with basic user
    {
      $match: match,
    },
    ...getGroupFilterPipeline(groupIds),
  ];

  processPipeline.push({
    $addFields: {
      currentMemberPermissions: {
        $filter: {
          input: {
            $concatArrays: ["$groupMembers", "$collectionGroupMembers"],
          },
          as: "member",
          cond: { $eq: ["$$member.userId", userId] },
        },
      },
    },
  });

  if (onlyGetProcessThatUserHaveEditPermission) {
    processPipeline.push({
      $match: {
        $or: [
          {
            currentMemberPermissions: {
              $elemMatch: {
                permissionId: GroupMemberPermissionEnum.EDITOR,
              },
            },
          },
          {
            $expr: {
              $eq: [
                "$createdBy",
                {
                  $toObjectId: userId,
                },
              ],
            },
          },
          {
            $expr: {
              $eq: [
                "$userProcesses.userId",
                {
                  $toObjectId: userId,
                },
              ],
            },
          },
          getMatchGroupProcessOfUserPipeline(),
        ],
      },
    });
  }

  const draftPipeline: AggregationPipeline = [
    ...getUserProcessDirectly(userId),
    {
      $lookup: {
        from: "collaborations",
        localField: "_id",
        foreignField: "processId",
        as: "collaborators",
      },
    },
    {
      $unwind: {
        path: "$collaborators",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "groupprocesses",
        localField: "_id",
        foreignField: "processId",
        as: "groups",
      },
    },
    {
      $lookup: {
        from: "groupmembers",
        localField: "groups.groupId",
        foreignField: "groupId",
        as: "groupMembers",
      },
    },
    {
      $addFields: {
        currentMember: {
          $filter: {
            input: "$groupMembers",
            as: "member",
            cond: {
              $eq: ["$$member.userId", userId],
            },
          },
        },
      },
    },
    ...filterTagDocumentTypeUserPipeline,
    {
      $match: match,
    },
    {
      $group: {
        _id: "$_id",
        name: {
          $first: "$name",
        },
        description: {
          $first: "$description",
        },
        owner: {
          $first: "$owner",
        },
        startDate: {
          $first: "$startDate",
        },
        endDate: {
          $first: "$endDate",
        },
        userId: {
          $first: "$userId",
        },
        image: {
          $first: "$image",
        },
        procedureIcon: {
          $first: "$procedureIcon",
        },
        totalTime: {
          $first: "$totalTime",
        },
        organizationId: {
          $first: "$organizationId",
        },
        collectionId: {
          $first: "$collectionId",
        },
        releaseNote: {
          $first: "$releaseNote",
        },
        editorNote: {
          $first: "$editorNote",
        },
        public: {
          $first: "$public",
        },
        status: {
          $first: "$status",
        },
        reason: {
          $first: "$reason",
        },
        primaryGroupId: {
          $first: "$primaryGroupId",
        },
        processWorkflowId: {
          $first: "$processWorkflowId",
        },
        processWorkflowStepId: {
          $first: "$processWorkflowStepId",
        },
        documentTypeId: {
          $first: "$documentTypeId",
        },
        checkedOut: {
          $first: "$checkedOut",
        },
        checkedOutById: {
          $first: "$checkedOutById",
        },
        checkedOutDate: {
          $first: "$checkedOutDate",
        },
        dateSubmitted: {
          $first: "$dateSubmitted",
        },
        reviewerId: {
          $first: "$reviewerId",
        },
        reviewStarted: {
          $first: "$reviewStarted",
        },
        reviewComplete: {
          $first: "$reviewComplete",
        },
        previousStatus: {
          $first: "$previousStatus",
        },
        publishedDate: {
          $first: "$publishedDate",
        },
        rejectedDate: {
          $first: "$rejectedDate",
        },
        rejectedById: {
          $first: "$rejectedById",
        },
        publishedById: {
          $first: "$publishedById",
        },
        updatedAt: {
          $first: "$updatedAt",
        },
        createdAt: {
          $first: "$createdAt",
        },
        createdBy: {
          $first: "$createdBy",
        },
        steps: {
          $first: "$steps",
        },
        collections: {
          $first: "$collections",
        },
        version: {
          $first: "$version",
        },
        isPublished: {
          $first: "$isPublished",
        },
        collaborators: {
          $addToSet: "$collaborators",
        },
      },
    },
    ...getGroupFilterPipeline(groupIds),
  ];

  if (!isCounting) {
    const dataPipeline: AggregationPipeline = [
      {
        $sort: sortField === "name" ? { name: 1 } : { [sortField]: -1 },
      },
      {
        $facet: {
          paginatedResults: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $lookup: {
                from: "steps",
                let: {
                  processId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$processId", "$$processId"],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "medias",
                      localField: "_id",
                      foreignField: "stepId",
                      as: "media",
                    },
                  },
                ],
                as: "steps",
              },
            },
            {
              $lookup: {
                from: "groupprocesses",
                localField: "_id",
                foreignField: "processId",
                as: "groups",
              },
            },
            {
              $lookup: {
                from: "groups",
                localField: "groups.groupId",
                foreignField: "_id",
                as: "groups",
              },
            },
            {
              $lookup: {
                from: "documenttypes",
                let: {
                  documentTypeId: "$documentTypeId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$_id", "$$documentTypeId"],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "icons",
                      localField: "iconId",
                      foreignField: "_id",
                      as: "iconBuilder",
                    },
                  },
                  {
                    $unwind: {
                      path: "$iconBuilder",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: "documentType",
              },
            },
            {
              $unwind: {
                path: "$documentType",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                iconBuilder: "$documentType.iconBuilder",
              },
            },
            {
              $lookup: {
                from: "tags",
                localField: "processesTags.tagId",
                foreignField: "_id",
                as: "tags",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "creator",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$creator",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                creatorName: {
                  $concat: ["$creator.firstName", " ", "$creator.lastName"],
                },
                creatorImage: "$creator.image",
              },
            },
            {
              $addFields: {
                creatorName: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ["$creatorName", null] },
                        { $eq: ["$creatorName", ""] },
                        { $eq: ["$creatorName", undefined] },
                        { $eq: [{ $type: "$creatorName" }, "missing"] },
                      ],
                    },
                    then: {
                      $concat: ["$user.firstName", " ", "$user.lastName"],
                    },
                    else: "$creatorName",
                  },
                },
                creatorImage: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ["$creatorImage", null] },
                        { $eq: ["$creatorImage", ""] },
                        { $eq: ["$creatorImage", undefined] },
                        { $eq: [{ $type: "$creatorImage" }, "missing"] },
                      ],
                    },
                    then: "$user.image",
                    else: "$creatorImage",
                  },
                },
              },
            },
            {
              $project: {
                _id: false,
                id: "$_id",
                name: true,
                description: true,
                owner: true,
                startDate: true,
                endDate: true,
                userId: true,
                image: true,
                procedureIcon: true,
                totalTime: true,
                organizationId: true,
                releaseNote: true,
                editorNote: true,
                public: true,
                status: true,
                reason: true,
                primaryGroupId: true,
                processWorkflowId: true,
                processWorkflowStepId: true,
                documentTypeId: true,
                documentType: true,
                checkedOut: true,
                checkedOutById: true,
                checkedOutDate: true,
                dateSubmitted: true,
                reviewerId: true,
                reviewStarted: true,
                reviewComplete: true,
                previousStatus: true,
                publishedDate: true,
                rejectedDate: true,
                rejectedById: true,
                publishedById: true,
                updatedAt: true,
                createdAt: true,
                steps: true,
                collections: true,
                version: true,
                isPublished: true,
                groups: true,
                archivedAt: true,
                currentMemberPermissions: true,
                iconBuilder: true,
                tags: true,
                creatorName: true,
                creatorImage: true,
                createdBy: true,
              },
            },
          ],
          totalResults: [
            {
              $count: "count",
            },
          ],
        },
      },
    ];

    processPipeline.push(...dataPipeline);
    draftPipeline.push(...dataPipeline);
  }
  return isPublished ? processPipeline : draftPipeline;
}

function getProcessesInGroupOnly(userId: string): AggregationPipeline {
  const pipeline = [
    {
      $lookup: {
        from: "groupprocesses",
        localField: "_id",
        foreignField: "processId",
        as: "groupsProcesses",
      },
    },
    {
      $lookup: {
        from: "groupmembers",
        localField: "groupsProcesses.groupId",
        foreignField: "groupId",
        as: "groupMembers",
      },
    },
    {
      $lookup: {
        from: "collectionprocesses",
        localField: "_id",
        foreignField: "processId",
        as: "collectionsProcesses",
      },
    },
    {
      $lookup: {
        from: "collections",
        localField: "collectionsProcesses.collectionId",
        foreignField: "_id",
        as: "collections",
      },
    },
    {
      $lookup: {
        from: "collectiongroups",
        localField: "collections._id",
        foreignField: "collectionId",
        as: "collectionGroups",
      },
    },
    {
      $lookup: {
        from: "groupmembers",
        localField: "collectionGroups.groupId",
        foreignField: "groupId",
        as: "collectionGroupMembers",
      },
    },
    {
      $addFields: {
        memberIds: {
          $concatArrays: [
            "$groupMembers.userId",
            "$collectionGroupMembers.userId",
          ],
        },
      },
    },
    {
      $addFields: {
        groupIds: {
          $map: {
            input: {
              $filter: {
                input: "$groupMembers",
                as: "member",
                cond: {
                  $eq: [
                    "$$member.userId",
                    {
                      $toObjectId: userId,
                    },
                  ],
                },
              },
            },
            as: "filteredMember",
            in: "$$filteredMember.groupId",
          },
        },
      },
    },
    ...getUserProcessDirectly(userId),
    {
      $match: {
        $or: [
          {
            $expr: {
              $eq: [
                "$memberIds",
                {
                  $toObjectId: userId,
                },
              ],
            },
          },
          {
            $expr: {
              $eq: [
                "$createdBy",
                {
                  $toObjectId: userId,
                },
              ],
            },
          },
          {
            $expr: {
              $eq: [
                "$userProcesses.userId",
                {
                  $toObjectId: userId,
                },
              ],
            },
          },
          getMatchGroupProcessOfUserPipeline(),
        ],
      },
    },
    {
      $lookup: {
        from: "collectionprocesses",
        localField: "_id",
        foreignField: "processId",
        as: "collections",
      },
    },
    {
      $lookup: {
        from: "collections",
        localField: "collections.collectionId",
        foreignField: "_id",
        as: "collections",
        pipeline: [{ $project: { name: 1, _id: 0 } }],
      },
    },
  ];

  return pipeline;
}

function getUserProcessDirectly(userId: string): AggregationPipeline {
  return [
    {
      $lookup: {
        from: "userprocesses",
        localField: "_id",
        foreignField: "processId",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  "$userId",
                  {
                    $toObjectId: userId,
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              pipeline: [getUserDetailProjectPipeline],
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: "userProcesses",
      },
    },
    {
      $unwind: {
        path: "$userProcesses",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
}

export const getUserDetailProjectPipeline = {
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
};

export const getMatchGroupProcessOfUserPipeline = () => {
  return {
    $expr: {
      $anyElementTrue: {
        $map: {
          input: "$groupsProcesses",
          as: "groupsProcess",
          in: {
            $in: ["$$groupsProcess.groupId", "$groupIds"],
          },
        },
      },
    },
  };
};
