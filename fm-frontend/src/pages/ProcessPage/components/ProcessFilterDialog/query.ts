import trim from "lodash/trim";
import { AggregationPipeline } from "types/common/aggregation";

export function getDocumentTypesPipeline(
  keyword: string,
  organizationId: number
): AggregationPipeline {
  const pipeline = [
    {
      $match: {
        organizationId,
        name: {
          $regex: `.*${trim(keyword)}.*`,
          $options: "i",
        },
      },
    },
    {
      $lookup: {
        from: "Icon",
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
    {
      $addFields: {
        "iconBuilder.id": "$iconBuilder._id",
      },
    },
    {
      $limit: 50,
    },
    {
      $project: {
        _id: false,
        id: "$_id",
        name: true,
        icon: true,
        iconBuilder: true,
      },
    },
  ];
  return pipeline;
}

export function getGroupsPipeline(
  keyword: string,
  organizationId: number
): AggregationPipeline {
  const pipeline = [
    {
      $match: {
        organizationId,
        name: {
          $regex: `.*${trim(keyword)}.*`,
          $options: "i",
        },
      },
    },
    {
      $limit: 50,
    },
    {
      $project: {
        _id: false,
        id: "$_id",
        name: true,
      },
    },
  ];
  return pipeline;
}
