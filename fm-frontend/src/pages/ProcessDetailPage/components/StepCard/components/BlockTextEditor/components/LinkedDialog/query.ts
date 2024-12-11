import { AggregationPipeline, AggregationStage } from 'types/common/aggregation'

export function getStepsPipeline(keyword: string, organizationId: number): AggregationPipeline {
  let pipeline: AggregationPipeline = [
    {
      $lookup: {
        from: 'Process',
        localField: 'processId',
        foreignField: '_id',
        as: 'process'
      }
    },
    {
      $unwind: {
        path: '$process'
      }
    }
  ]

  let matchStage: AggregationStage = {
    $match: {
      'process.organizationId': organizationId
    }
  }

  if (keyword) {
    matchStage.$match = {
      name: {
        $regex: keyword,
        $options: 'i'
      }
    }
  }

  const projectStages: AggregationPipeline = [
    {
      $limit: 50
    },
    {
      $project: {
        _id: false,
        id: '$_id',
        name: true,
        time: true,
        processId: true,
        layoutId: true,
        createdAt: true,
        updatedAt: true,
        position: true,
        quizId: true,
        archived: true
      }
    }
  ]

  pipeline.push(matchStage, ...projectStages)
  return pipeline
}
