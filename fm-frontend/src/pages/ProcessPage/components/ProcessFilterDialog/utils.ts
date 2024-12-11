import trim from "lodash/trim";
// import { aggregateCollectionGroupSearch } from 'API/collection'

export async function getCollectionFilterForBasicUserPipeline(
  groupIds: number[],
  keyword: string,
  organizationId: number,
  skip: number,
  limit: number
) {
  const matchGroupPipeline = groupIds.map((groupId) => ({
    groupId,
  }));
  const pipeline = [
    {
      $match: {
        $or: matchGroupPipeline,
      },
    },
    {
      $lookup: {
        from: "Collection",
        localField: "collectionId",
        foreignField: "_id",
        as: "collection",
      },
    },
    {
      $unwind: {
        path: "$collection",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$collection",
      },
    },
    {
      $match: {
        name: {
          $regex: `.*${trim(keyword)}.*`,
          $options: "i",
        },
        organizationId,
      },
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
        ],
        totalResults: [
          {
            $count: "count",
          },
        ],
      },
    },
  ];

  // const result = await aggregateCollectionGroupSearch(pipeline)
  const result = null;
  return result;
}
