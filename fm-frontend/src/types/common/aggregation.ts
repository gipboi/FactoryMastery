export type AggregationStage = Record<string, unknown>
export type AggregationPipeline = AggregationStage[]
export type AggregationPayload = { pipeline: AggregationPipeline }
export interface AggregationCount {
  totalResults: number
}
