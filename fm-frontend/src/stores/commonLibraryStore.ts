// import { getCommonLibraryComponents } from "API/commonLibrary";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
// import { getDependentProcessesForFilter, getDependentProcessesOnCommonStep, getStepDetail } from 'API/step'
import { ICommonLibrary } from "interfaces/commonLibrary";
import { IProcess, IProcessWithRelations } from "interfaces/process";
import { IStepWithRelations } from "interfaces/step";
import { stepIncludes } from "pages/ProcessDetailPage/utils/filter";

export default class CommonLibraryStore {
  rootStore: RootStore;

  commonLibraryComponents?: ICommonLibrary[] = [];

  currentCommonStepDetail?: IStepWithRelations & {
    dependentProcesses?: IProcessWithRelations[];
  };

  dependentProcessesOptions?: IProcess[] = [];

  totalCommonStep: number = 0;

  isManageModeInList = false;

  isLoading = false;

  isFeatureEnabled = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  public setFeatureEnabled(isEnabled: boolean) {
    this.isFeatureEnabled = isEnabled;
  }

  async fetchCommonLibraryComponents(
    stepKeyword: string,
    limit?: number,
    offset?: number,
    sortBy: string = "updatedAt",
    dependentProcessIds?: number[]
  ): Promise<void> {
    this.isLoading = true;
    // const data = await getCommonLibraryComponents(
    //   stepKeyword,
    //   limit,
    //   offset,
    //   sortBy,
    //   dependentProcessIds
    // );
    // this.commonLibraryComponents = data?.paginatedResults ?? [];
    // this.totalCommonStep = data?.totalResults ?? 0;
    // this.isLoading = false;
  }

  public setManageModeInList(isManageMode: boolean) {
    this.isManageModeInList = isManageMode ?? false;
  }

  async fetchCurrentCommonStepDetail(
    id: string,
    fetchFullDetail: boolean = false
  ) {
    this.isLoading = true;
    const filter = {
      include: stepIncludes,
    };
    let dependentProcesses: IProcessWithRelations[] = [];
    if (fetchFullDetail) {
      // dependentProcesses = await getDependentProcessesOnCommonStep(id);
    }
    // const stepData = await getStepDetail(id, filter);
    // this.currentCommonStepDetail = { ...stepData, dependentProcesses };
    this.isLoading = false;
  }

  clearCurrentCommonStepDetail() {
    this.currentCommonStepDetail = undefined;
  }

  // async fetchDependentProcessesForFilter() {
  //   this.dependentProcessesOptions = await getDependentProcessesForFilter();
  // }
}
