import { EAlignEnum, ITableHeader } from "components/CkTable";
import { trim } from "lodash";
import { AggregationPipeline } from "types/common/aggregation";

export enum ETableHeader {
  ICON = "icon",
  NAME = "name",
  CREATED_BY = "createdBy",
  CREATED_AT = "createdAt",
  ACTIONS = "actions",
}

export function getHeaderList(): ITableHeader[] {
  const headers: ITableHeader[] = [
    {
      Header: "",
      accessor: ETableHeader.ICON,
      width: 4
    },
    {
      Header: "Type Name",
      accessor: ETableHeader.NAME,
    },
    {
      Header: "Created By",
      accessor: ETableHeader.CREATED_BY,
    },
    {
      Header: "Created At",
      accessor: ETableHeader.CREATED_AT,
    },
    {
      Header: "",
      accessor: ETableHeader.ACTIONS,
      align: EAlignEnum.RIGHT,
    },
  ];

  return headers;
}

export function getDocumentTypeByAggregation(
  organizationId: string,
  limit: number,
  skip: number,
  keyword: string,
  isCounting?: boolean,
  sort?: Record<string, number>
): AggregationPipeline {
  const pipeline: AggregationPipeline = [
    {
      $match: {
        name: {
          $regex: `.*${trim(keyword)}.*`,
          $options: "i",
        },
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
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "icons",
        let: { iconId: "$iconId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$iconId", "$_id"] },
                  { $ne: ["$isDeleted", true] },
                ],
              },
            },
          },
        ],
        as: "icon",
      },
    },
    {
      $unwind: {
        path: "$icon",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        id: "$_id",
      },
    },
    {
      $sort: sort,
    },
  ];

  if (!isCounting) {
    pipeline.push(
      {
        $skip: skip,
      },
      {
        $limit: limit,
      }
    );
  } else {
    const countPipeline: AggregationPipeline = [
      {
        $count: "totalResults",
      },
    ];
    pipeline.push(...countPipeline);
  }

  return pipeline;
}
