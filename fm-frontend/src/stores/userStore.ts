import {
  adminChangePassword,
  // getRecentlyViewed,
  getUserById,
  getUsers,
  getUsersByAggregate,
  updateUserById,
} from "API/user";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";
import { IGroupMember } from "interfaces/groups";
import { IProcessWithRelations } from "interfaces/process";
import {
  IAuditWithRelations,
  IUser,
  IUserWithRelations,
} from "interfaces/user";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { IFilter, IWhere } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { getValidArray } from "utils/common";
import { getFullName } from "utils/user";

export default class UserStore {
  rootStore: RootStore;
  currentUser: IUser | null = null;
  isManageMode: boolean = false;
  filter: IFilter<IUser> = {};
  isLoading: boolean = false;
  isManageModeInUserDetail = false;
  users: IUserWithRelations[] = [];
  currentUserGroupMembers: IGroupMember[] = [];
  numberOfUsers: number = 0;
  userDetail: IUserWithRelations = {};
  selectedUserDetail: IUserWithRelations = {};
  recentAudits: IAuditWithRelations[] = [];
  userDetailProcesses: IProcessWithRelations[] = [];
  countDetailProcess: number = 0;

  // userDetailProcesses: IEsGlobalSearchItem[] = []
  // userDetailCollections: IEsGlobalSearchItem[] = []

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  countUsers(filter?: IWhere<IUser>): number {
    return 0;
  }

  public setCurrentUser(user: IUser) {
    const haveEditorRole =
      this.currentUserGroupMembers.some(
        (groupMember) =>
          groupMember?.permission ??
          GroupMemberPermissionEnum.VIEWER !== GroupMemberPermissionEnum.VIEWER
      ) || user?.authRole !== AuthRoleNameEnum.BASIC_USER;
    this.currentUser = { ...user, isEditor: haveEditorRole };
  }

  setIsManageMode(isManageMode: boolean) {
    this.isManageMode = isManageMode;
  }

  public setDefaultUserListFilter(
    organizationId: string,
    pageIndex: number,
    pageSize: number
  ): void {
    this.filter = {
      where: {
        organizationId,
        disabled: false,
      },
      include: ["authRole", "groupMembers"],
      skip: (pageIndex - 1) * pageSize,
      limit: pageSize,
      order: ["updatedAt DESC"],
    };
  }

  public setCurrentUserGroupMembers(groupMembers: IGroupMember[]) {
    this.currentUserGroupMembers = groupMembers;
  }

  public async getUsersByPipeline(
    pipeline: AggregationPipeline = []
  ): Promise<void> {
    this.isLoading = true;
    const dataResponse = await getUsersByAggregate(pipeline);

    this.users = getValidArray(dataResponse?.results) as IUserWithRelations[];
    this.numberOfUsers = dataResponse?.totalCount?.[0]?.total ?? 0;
    this.isLoading = false;
  }

  public async updateUser(userId: string, userData: IUser = {}): Promise<void> {
    this.isLoading = true;
    await updateUserById(userId, userData);
    this.isLoading = false;
  }

  public setManageModeInUserDetail(isManageMode: boolean) {
    this.isManageModeInUserDetail = isManageMode ?? false;
  }

  public setManageMode(isManageMode: boolean) {
    this.isManageMode = isManageMode;
  }

  public async getUserDetail(
    userId: string,
    filter?: IFilter<IUserWithRelations>,
    isSelected?: boolean
  ) {
    this.isLoading = true;
    const userDetail = await getUserById(userId, filter);

    if (userDetail?.userProcesses?.length) {
      //*INFO: Mapping userProcesses to get the correct data
      const listMappedProcesses = getValidArray(userDetail?.userProcesses).map(
        (userProcess) => {
          const process: IProcessWithRelations =
            (userProcess?.process as any)?.[0] ?? userProcess?.process;
          const creator = (process?.creator as any)?.[0] ?? process?.creator;
          const mappedProcess = {
            ...process,
            creator: {
              ...creator,
              id: creator?.id ?? creator?._id ?? "",
            },
            groups: process?.groups?.map((group) => {
              const groupData =
                (group as any)?.group?.[0] ?? (group as any)?.group ?? {};
              return {
                ...groupData,
                id: groupData?.id ?? groupData?._id ?? "",
              };
            }),
          };
          return mappedProcess;
        }
      );
      this.userDetailProcesses = listMappedProcesses;
    }

    if (isSelected) {
      this.selectedUserDetail = userDetail;
    } else {
      this.userDetail = {
        ...userDetail,
        fullName: getFullName(userDetail?.firstName, userDetail?.lastName),
        image: userDetail?.image ?? "",
      };
    }
    this.isLoading = false;
  }

  public async getUsers(filter?: IFilter<IUserWithRelations>) {
    this.isLoading = true;
    const users = await getUsers(filter);
    this.users = users;
    this.isLoading = false;
  }

  public clearStore(): void {
    this.userDetail = {} as IUserWithRelations;
    this.userDetailProcesses = [];
    this.countDetailProcess = 0;
  }

  public async fetchRecentlyViewed(): Promise<void> {
    this.isLoading = true;
    // this.recentAudits = await getRecentlyViewed();
    this.isLoading = false;
  }

  public async adminChangePassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    this.isLoading = true;
    await adminChangePassword({ userId, newPassword }).finally(() => {
      this.isLoading = false;
    });
  }

  public async getDetailProcess(filter: IFilter<any>): Promise<void> {
    try {
      this.isLoading = true;

      // const searchResult = await searchGlobal(filter)
      // this.userDetailProcesses = searchResult.data
      // this.countDetailProcess = searchResult.total

      this.isLoading = false;
    } catch (error: any) {
      console.log(
        "🚀 Log ~ file: userStore.ts Log ~ line 184 Log ~ UserStore Log error",
        error
      );
    }
  }

  public async refetchUserList(): Promise<void> {
    await Promise.all([
      this.getUsers(this.filter),
      this.countUsers(this.filter?.where),
    ]);
  }
}
