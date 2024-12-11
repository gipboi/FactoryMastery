import get from 'lodash/get'
import { IProcessWithRelations } from 'interfaces/process'

export function queryParser(response: unknown): IProcessWithRelations[] {
  if (!Array.isArray(response)) return []
  return response?.map(process => {
    try {
      return {
        ...process,
        collections: get(process, 'collections', [])
      }
    } catch (error: any) {
      return []
    }
  })
}
