import {
  aggregateProcessesSearch,
  getAllProcesses,
  getDetailProcessById,
} from 'API/process';
import { updateStepBatch } from 'API/step';
import { ProcessList } from 'constants/process';
import {
  IProcess,
  IProcessesFilterForm,
  IProcessWithRelations,
} from 'interfaces/process';
import { IStep, IStepWithRelations } from 'interfaces/step';
import { debounce, escapeRegExp, set } from 'lodash';
import trim from 'lodash/trim';
import { makeAutoObservable } from 'mobx';
import { RootStore } from 'stores';
import { AggregationPipeline } from 'types/common/aggregation';
import { IFilter } from 'types/common/query';

class ProcessStore {
  rootStore: RootStore;

  // Define the properties and methods of ProcessStore here
  process: IProcessWithRelations = {} as IProcessWithRelations;
  processes: IProcessWithRelations[] = [];
  selectedProcess: IProcessWithRelations = {} as IProcessWithRelations;
  processDetail: IProcessWithRelations = {} as IProcessWithRelations;
  processList: IProcessWithRelations[] = [];
  processesFilter: IProcessesFilterForm = {
    collections: [],
    documentTypes: [],
    creators: [],
    groups: [],
    sort: '',
  };
  isFetchingList: boolean = false;
  selectedProcessId: string = '';
  processSteps: IStep[] = [];
  newProcessGroupIds: string[] = [];
  expandingSteps: string[] = [];
  isManageModeInDetail = false;
  isManageModeInProcessList = false;
  canUserEditInProcessList = false;
  timeFetchingList: number = new Date().getTime();
  numberOfProcesses: number = 0;
  canUserEditInProcessDetail = false;
  isSearching: boolean | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  public setProcessesFilter(processesFilter: IProcessesFilterForm): void {
    this.processesFilter = { ...this.processesFilter, ...processesFilter };
  }

  public setNewProcessGroupIds(newProcessGroupIds: string[]): void {
    this.newProcessGroupIds = newProcessGroupIds;
  }

  public setManageModeInList(isManageMode: boolean) {
    this.isManageModeInProcessList = isManageMode ?? false;
  }

  public setManageModeInDetail(isManageMode: boolean) {
    this.isManageModeInDetail = isManageMode ?? false;
  }

  public setSelectedProcessId(processId: string): void {
    this.selectedProcessId = processId;
  }

  public setSelectedProcess(process: IProcessWithRelations): void {
    this.selectedProcess = process;
  }

  public setIsFetchingList(isFetchingList: boolean): void {
    this.isFetchingList = isFetchingList;
  }

  public setCanUserEditInProcessDetail(canEdit: boolean) {
    this.canUserEditInProcessDetail = canEdit;
  }

  public async getProcessDetail(
    processId?: string,
    filter: IFilter<IProcess> = {}
  ): Promise<void> {
    if (this.rootStore.iconBuilderStore.defaultIcons.length === 0) {
      this.rootStore.iconBuilderStore.fetchCMSIconList();
    }
    const process = await this.getProcessDetailById(processId ?? '');
    this.process = process;
    // const notificationsOnStepUpdate = await getNotifications({
    //   where: {
    //     type: NotificationTypeEnum.UPDATED_COMMON_STEP_NOTIFICATION,
    //     processId,
    //   },
    // });
    // this.commonStepIdsNeedToUpdate =
    //   getValidArray(notificationsOnStepUpdate).map(
    //     (notification) => notification.stepId
    //   ) ?? [];
    this.selectedProcess = process;
    this.selectedProcessId = processId ?? '';
  }

  public async setProcessStepPosition(
    items: IStepWithRelations[],
    startIndex: number,
    endIndex: number
  ): Promise<void> {
    const updatedSteps = items.map((step, index) => ({
      ...step,
      position: index + 1,
    }));
    await updateStepBatch(updatedSteps);
    this.process.steps = updatedSteps;
  }

  public resetProcessSteps(): void {
    this.processSteps = [];
  }

  public setCanUserEditInProcessList(canEdit: boolean) {
    this.canUserEditInProcessList = canEdit;
  }

  public setExpandingSteps(expandingSteps: string[]): void {
    this.expandingSteps = expandingSteps;
  }

  public async getAllProcessList(
    organizationId: string,
    offset: number,
    keyword: string = ''
  ): Promise<void> {
    const filter: IFilter<IProcess> = {
      where: {
        organizationId,
        name: { $regex: trim(keyword), $options: 'i' },
        $or: [
          { archivedAt: { $exists: false } },
          { archivedAt: { $eq: null } } as any,
        ],
      },
      offset: offset,
      limit: ProcessList.LIMIT,
      order: ['updatedAt DESC'],
      include: [
        {
          relation: 'documentType',
          // scope: { include: [{ relation: "icon" }] },
        },
        { relation: 'steps' },
      ],
    };

    const responseData = await getAllProcesses(filter);
    this.processList = [...this.processList, ...responseData];
  }

  public async getProcessByAggregate(
    dataQuery: AggregationPipeline = [],
    customParser: (response: unknown) => IProcessWithRelations[]
  ): Promise<void> {
    const currentTime: number = new Date().getTime();
    this.isFetchingList = true;
    const responseData = await aggregateProcessesSearch(dataQuery, currentTime);
    this.processes = customParser(responseData?.paginatedResults ?? []);
    this.numberOfProcesses =
      (responseData?.totalResults as any)?.[0]?.count ?? 0;
    this.isFetchingList = false;
  }

  public async getProcessDetailById(
    processId: string
  ): Promise<IProcessWithRelations> {
    const processDetail = (await getDetailProcessById(processId))
      ?.paginatedResults?.[0];
    this.processDetail = processDetail;
    return processDetail;
  }

  public async search(
    keyword: string,
    offset: number,
    organizationId?: string,
    documentTypeIds?: string[],
    tagIds?: string[],
    creatorIds?: string[]
  ): Promise<void> {
    const searchKeyword: string = escapeRegExp(trim(keyword));
    try {
      const filter = {
        offset,
        limit: ProcessList.LIMIT,
        where: {
          isPublished: true,
          organizationId: organizationId ?? '',
          name: { $regex: trim(searchKeyword), $options: 'i' },
          $or: [
            { archivedAt: { $exists: false } },
            { archivedAt: { $eq: null } },
          ],
        },
        order: ['updatedAt DESC'],
        include: [
          {
            relation: 'documentType',
            scope: { include: [{ relation: 'icon' }] },
          },
          { relation: 'steps' },
          { relation: 'tags' },
          { relation: 'creator' },
        ],
      };

      if (documentTypeIds?.length) {
        set(filter, 'where.documentTypeId', { $in: documentTypeIds });
      }

      if (creatorIds?.length) {
        set(filter, 'where.createdBy', { $in: creatorIds });
      }

      const responseData = await getAllProcesses(filter as IFilter<IProcess>);
      if (tagIds?.length) {
        const filteredProcesses = responseData.filter((process) =>
          process.tags?.some((tag: any) => tagIds.includes(tag?.tagId ?? ''))
        );
        this.processList = filteredProcesses;
        return;
      }

      this.processList = responseData;
    } catch (error) {
      console.log('search Log ~ error', error);
    }
    this.isSearching = false;
  }

  debouncedSearch = debounce(this.search, 700);

  public changeSearchText(
    searchText: string,
    offset?: number,
    organizationId?: string
  ): void {
    this.isSearching = true;
    this.debouncedSearch(searchText, offset ?? 0, organizationId);
  }
}

export default ProcessStore;
