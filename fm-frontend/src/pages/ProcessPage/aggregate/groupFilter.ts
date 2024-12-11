import { AggregationPipeline } from "types/common/aggregation";

export function getGroupFilterPipeline(
  groupIds: string[]
): AggregationPipeline {
  const groupIdsMatch = groupIds.map((groupId) => ({
    $expr: {
      $eq: [
        "$groupId",
        {
          $toObjectId: groupId,
        },
      ],
    },
  }));
  const groupFilterPipeline =
    groupIds?.length > 0
      ? [
          {
            $lookup: {
              from: "groupprocesses",
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
                        {
                          $or: [...groupIdsMatch],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "groupsProcesses",
            },
          },
          {
            $unwind: {
              path: "$groupsProcesses",
            },
          },
        ]
      : [];
  return groupFilterPipeline;
}
