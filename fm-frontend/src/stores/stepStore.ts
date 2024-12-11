import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { AggregationPipeline } from "types/common/aggregation";
// import { getStepsByAggregate } from 'API/step'
import { IStep } from "interfaces/step";

class StepStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  steps: IStep[] = [];
  selectedStep?: IStep;

  public async fetchStepsByAggregate(
    pipeline: AggregationPipeline = []
  ): Promise<void> {
    // this.steps = await getStepsByAggregate(pipeline);
  }
}

export default StepStore;
