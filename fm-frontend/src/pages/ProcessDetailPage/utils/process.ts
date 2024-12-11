import { IProcess } from "interfaces/process";
import ProcessStore from "stores/processStore";
import { IFilter } from "types/common";
import { getProcessFilter } from "./filter";

export function getRenderProcess(
  processId: string,
  processStore: ProcessStore
): Promise<void> {
  const filter: IFilter<IProcess> = getProcessFilter();
  return processStore.getProcessDetail(processId, filter);
}
