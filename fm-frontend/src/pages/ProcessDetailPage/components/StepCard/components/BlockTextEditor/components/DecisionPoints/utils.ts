import filter from 'lodash/filter'
import { IDecisionPointLink } from 'interfaces/decisionPoint'

export function deleteDecisionPoint(
  order: number,
  decisionPoints: IDecisionPointLink[],
  setDecisionPoints: (decisionPoints: IDecisionPointLink[]) => void
): void {
  const newDecisionPoints = filter(decisionPoints, (_, index: number) => index !== order)
  setDecisionPoints(newDecisionPoints)
}
