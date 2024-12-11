import {
  aggregateCountGroups,
  getGroupById,
  getGroupMembers,
  getGroups,
  getGroupsByAggregate,
} from "API/groups";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { IGroup, IGroupMember, IGroupMemberDetail } from "interfaces/groups";
import { makeAutoObservable } from "mobx";
import { getGroupMemberAggregation } from "pages/GroupUserPage/utils";
import { toast } from "react-toastify";
import { RootStore } from "stores";
import { IFilter } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";

export default class GroupStore {
  rootStore: RootStore;
  groups: IGroup[] = [];
  totalGroupsCount: number = 0;
  isLoading: boolean = false;
  groupDetail: IGroup | undefined = undefined;
  groupMemberPermissions: GroupMemberPermissionEnum[] = [];
  groupMembers: IGroupMember[] = [];
  groupMembersDetail: IGroupMember[] = [];
  numberOfGroupMembers: number = 0;
  isManageModeInMemberList: boolean = false;
  isManageMode: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  public setManageModeInMemberList(isManageMode: boolean) {
    this.isManageModeInMemberList = isManageMode ?? false;
  }

  public setManageMode(isManageMode: boolean) {
    this.isManageMode = isManageMode ?? false;
  }

  public setGroupMembers(groupMembers: IGroupMember[]) {
    this.groupMembers = groupMembers ?? [];
  }

  async fetchGroupMemberOfCurrentUser(): Promise<void> {
    const { paginatedResults = [], totalCount = { count: 0 } } =
      await getGroupMembers(
        getGroupMemberAggregation(
          "",
          this.rootStore.authStore.userDetail?.organizationId ?? "",
          undefined,
          undefined,
          undefined,
          this.rootStore.authStore.userDetail?.id ?? ""
        )
      );
    const groupMembers = paginatedResults;
    this.setGroupMembers(groupMembers);
  }

  async fetchGroupList(): Promise<void> {
    try {
      const groups = await getGroups({
        where: {
          organizationId:
            this?.rootStore?.organizationStore?.organization?.id ?? "",
        },
      });
      this.groups = groups;
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  }

  public async getGroupListByAggregate(
    pipeline: AggregationPipeline = [],
    countPipeline: AggregationPipeline = []
  ): Promise<void> {
    this.isLoading = true;
    const dataResponse = await getGroupsByAggregate(pipeline);
    const countResponse = await aggregateCountGroups(countPipeline);
    this.groups = dataResponse;
    this.totalGroupsCount = countResponse;
    this.isLoading = false;
  }

  public async getGroups(filter: IFilter<IGroup> = {}): Promise<void> {
    this.isLoading = true;
    const groups = await getGroups(filter);
    this.groups = groups;
    this.isLoading = false;
  }

  public async getGroupDetail(id: string): Promise<void> {
    this.isLoading = true;
    this.groupDetail = await getGroupById(id);
    this.isLoading = false;
  }

  public async getGroupMembers(
    pipeline: AggregationPipeline = []
  ): Promise<void> {
    this.isLoading = true;
    const { paginatedResults = [], totalCount = { count: 0 } } =
      await getGroupMembers(pipeline);
    this.groupMembersDetail = paginatedResults;
    this.numberOfGroupMembers = (totalCount as any)?.total ?? 0;
    this.isLoading = false;
  }

  public resetStore(): void {
    this.groups = [];
    this.groupDetail = undefined;
    this.groupMemberPermissions = [];
    this.groupMembersDetail = [];
    this.numberOfGroupMembers = 0;
    this.totalGroupsCount = 0;
    this.isLoading = false;
  }
}
