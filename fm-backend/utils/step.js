export const stepIncludeFullDataPipeline = [
  {
    $lookup: {
      from: "blocks",
      localField: "_id",
      foreignField: "stepId",
      pipeline: [
        {
          $lookup: {
            from: "decisionpoints",
            localField: "_id",
            foreignField: "blockId",
            pipeline: [
              {
                $lookup: {
                  from: "decisionpointsteps",
                  localField: "_id",
                  foreignField: "decisionPointId",
                  pipeline: [
                    {
                      $lookup: {
                        from: "steps",
                        localField: "stepId",
                        foreignField: "_id",
                        as: "step",
                      },
                    },
                  ],
                  as: "decisionPointSteps",
                },
              },
              {
                $lookup: {
                  from: "decisionpointmedias",
                  localField: "_id",
                  foreignField: "decisionPointId",
                  pipeline: [
                    {
                      $lookup: {
                        from: "media",
                        localField: "mediaId",
                        foreignField: "_id",
                        as: "media",
                      },
                    },
                  ],
                  as: "decisionPointMedias",
                },
              },
              {
                $sort: { position: 1 },
              },
            ],
            as: "decisionPoints",
          },
        },
        {
          $lookup: {
            from: "medias",
            localField: "mediaId",
            foreignField: "_id",
            as: "media",
          },
        },
        {
          $lookup: {
            from: "blockmedias",
            localField: "_id",
            foreignField: "blockId",
            pipeline: [
              {
                $lookup: {
                  from: "media",
                  localField: "mediaId",
                  foreignField: "_id",
                  as: "media",
                },
              },
            ],
            as: "blockMedias",
          },
        },
        {
          $sort: {
            position: 1,
          },
        },
      ],
      as: "blocks",
    },
  },
  {
    $lookup: {
      from: "media",
      localField: "_id",
      foreignField: "stepId",
      as: "media",
    },
  },
  {
    $sort: {
      position: 1,
    },
  },
  {
    $addFields: {
      id: "$_id",
    },
  },
];
