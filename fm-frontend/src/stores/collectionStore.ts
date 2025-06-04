import {
  getCollection,
  getCollectionsByFilter,
  getCollectionsByGroups,
} from 'API/collection';
import { getGroups } from 'API/groups';
import { GroupMemberPermissionEnum } from 'constants/enums/group';
import { AuthRoleNameEnum } from 'constants/user';
import {
  ICollection,
  ICollectionFilter,
  ICollectionsProcess,
} from 'interfaces/collection';
import { IGroup } from 'interfaces/groups';
import { IUser } from 'interfaces/user';
import { makeAutoObservable } from 'mobx';
import { RootStore } from 'stores';
import { Fields, IOption, IWhere } from 'types/common';
import { getValidArray } from 'utils/common';

class CollectionStore {
  rootStore: RootStore;

  isSearching: boolean | null = null;
  isLoading = false;
  isEditing = false;
  isManageMode = false;
  isManagePermission = false;
  isOpenDiscardModal = false;

  collections: ICollection[] = [];
  selectedCollectionId: string | null = null;
  totalCollections: number = 0;
  size: number = 8;
  from: number = 0;

  overviewCollection: ICollection | null = null;
  collection: ICollection | null = null;

  groupFilterOptions: IGroup[] = [];
  lastFilter: ICollectionFilter | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  public changePage(page: number, fetchFunction: () => Promise<void>): void {
    this.from = (page - 1) * this.size;
    fetchFunction();
  }

  public changeSize = (pageIndex: number = 8): void => {
    this.size = Number(pageIndex);
  };

  public async getOverviewCollection(
    collectionId: string
  ): Promise<ICollection> {
    this.selectedCollectionId = collectionId;
    const collection: ICollection = await getCollection(collectionId, {
      include: [
        {
          relation: 'collectionsProcesses',
          scope: {
            fields: ['processId', 'collectionId'],
            include: [
              {
                relation: 'process',
                scope: {
                  where: {
                    archivedAt: { $in: [undefined, null] },
                  },
                  fields: [
                    'id',
                    'image',
                    'name',
                    'procedureIcon',
                    'documentTypeId',
                    'archivedAt',
                  ],
                  include: [
                    {
                      relation: 'steps',
                      scope: {
                        fields: ['id', 'processId'],
                        include: [
                          {
                            relation: 'media',
                            scope: {
                              fields: [
                                'id',
                                'image',
                                'stepId',
                                'mediaType',
                                'video',
                              ],
                              where: {
                                mediaType: { $in: ['image', 'video'] },
                              },
                              order: ['position ASC'],
                            },
                          },
                        ],
                        order: ['position ASC'],
                      },
                    },
                    {
                      relation: 'documentType',
                      scope: {
                        include: [
                          {
                            relation: 'icon',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            order: ['position ASC'],
          },
        },
        {
          relation: 'collectionGroups',
          scope: {
            fields: ['groupId', 'collectionId'],
            include: [
              {
                relation: 'group',
                scope: {
                  where: {
                    archivedAt: { $in: [undefined, null] },
                  },
                  fields: ['id', 'image', 'name', 'archivedAt'],
                },
              },
            ],
          },
        },
      ],
    });
    const collectionsProcesses: ICollectionsProcess[] = getValidArray(
      collection?.collectionsProcesses
    ) as ICollectionsProcess[];

    this.overviewCollection = { ...collection, collectionsProcesses };

    return collection;
  }

  public async getCollectDetail(collectionId: string): Promise<ICollection> {
    this.selectedCollectionId = collectionId;
    const collection: ICollection = await getCollection(collectionId, {
      include: [
        {
          relation: 'collectionsProcesses',
          scope: {
            fields: ['processId', 'collectionId'],
            include: [
              {
                relation: 'process',
                scope: {
                  fields: [
                    'id',
                    'image',
                    'name',
                    'procedureIcon',
                    'documentTypeId',
                    'archivedAt',
                    'createdBy',
                    'isPublished',
                  ],
                  include: [
                    {
                      relation: 'steps',
                      scope: {
                        fields: ['id', 'processId'],
                        include: [
                          {
                            relation: 'media',
                            scope: {
                              fields: [
                                'id',
                                'image',
                                'stepId',
                                'mediaType',
                                'video',
                              ],
                              where: {
                                mediaType: { $in: ['image', 'video'] },
                              },
                              order: ['position ASC'],
                            },
                          },
                        ],
                        order: ['position ASC'],
                      },
                    },
                    {
                      relation: 'documentType',
                      scope: {
                        include: [
                          {
                            relation: 'icon',
                          },
                        ],
                      },
                    },
                    {
                      relation: 'tags',
                    },
                  ],
                },
              },
            ],
            order: ['position ASC'],
          },
        },
        {
          relation: 'userCollections',
        },
        {
          relation: 'collectionGroups',
          scope: {
            fields: ['groupId', 'collectionId'],
            include: [
              {
                relation: 'group',
                scope: {
                  where: {
                    archivedAt: { $in: [undefined, null] },
                  },
                  fields: ['id', 'image', 'name', 'archivedAt'],
                },
              },
            ],
          },
        },
      ],
    });

    const groupIdsOfCollection = getValidArray(collection?.groups).map(
      (group) => group?.id
    );
    const editorGroupIdsOfUser = getValidArray(
      this.rootStore.userStore.currentUserGroupMembers
    )
      .filter(
        (groupMember) =>
          groupMember?.permission !== GroupMemberPermissionEnum.VIEWER
      )
      .map((groupMember) => groupMember?.groupId);

    const isManagePermission = groupIdsOfCollection?.some((groupId) =>
      editorGroupIdsOfUser?.includes(groupId ?? '')
    );

    this.isManagePermission = isManagePermission;

    this.collection = {
      ...collection,
      collectionsProcesses: getValidArray(
        collection?.collectionsProcesses
      ).filter(
        (collectionProcess) =>
          collectionProcess?.process?.isPublished &&
          (collectionProcess?.process?.hasOwnProperty('archivedAt') !==
            undefined ||
            collectionProcess?.process?.archivedAt === null)
      ),
    };
    return collection;
  }

  public async fetchCollectionsByFilter(
    filter: ICollectionFilter,
    useLastFilter: boolean = false
  ): Promise<void> {
    this.isLoading = true;
    const apiFilter =
      useLastFilter && this.lastFilter
        ? { ...this.lastFilter, skip: 0 }
        : filter;
    const response = await getCollectionsByFilter(apiFilter);

    this.collections = response.paginatedResults ?? [];
    this.totalCollections = Array.isArray(response?.totalResults)
      ? response.totalResults.reduce((sum, item) => sum + (item.count || 0), 0)
      : response?.totalResults ?? 0;
    if (!useLastFilter) {
      this.lastFilter = filter;
    }
    this.isLoading = false;
  }

  public async fetchCollectionsByGroup(filter: {
    where: IWhere<ICollection | any>;
    groups?: number[] | string[];
    limit?: number;
    offset?: number;
    fields?: Fields<ICollection>;
    order?: string[];
  }): Promise<{ result: ICollection[]; totalCount: number }> {
    this.isSearching = true;
    const response = await getCollectionsByGroups({
      ...filter,
      groups: filter.groups?.map((group) => String(group)),
    });
    this.collections = response.result;
    this.totalCollections = response.totalCount;
    this.isSearching = false;
    return response;
  }

  public async fetchGroupOptions(
    userDetail: IUser
  ): Promise<IOption<string>[]> {
    const isBasicUser =
      // this.authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER; //Ask Tien
      this.rootStore.authStore.userDetail?.authRole ===
      AuthRoleNameEnum.BASIC_USER;
    const groupOptions: IOption<string>[] = [];
    if (isBasicUser) {
      const currentUserGroupMembers =
        this?.rootStore?.userStore?.currentUserGroupMembers ?? [];
      const groupIdsUserIsMember = currentUserGroupMembers.map(
        (groupMember) => groupMember.groupId
      );
      const basicUserQuery = {
        where: {
          id: {
            inq: groupIdsUserIsMember,
          },
        },
        fields: ['id', 'name'],
      };
      const groups = await getGroups(basicUserQuery);
      this.groupFilterOptions = groups;
      groupOptions.push(
        ...[
          ...groups.map((group) => ({
            label: group?.name ?? '',
            value: String(group?.id),
          })),
        ]
      );
    } else {
      const organizationId = userDetail?.organizationId ?? '';
      const adminQuery = {
        where: {
          organizationId,
        },
        fields: ['id', 'name'],
      };
      const groups = await getGroups(adminQuery);
      this.groupFilterOptions = groups;
      groupOptions.push(
        ...[
          ...groups.map((group) => ({
            label: group?.name ?? '',
            value: String(group?.id),
          })),
        ]
      );
    }
    return groupOptions;
  }

  public setCollections(collections: ICollection[], count: number) {
    this.collections = collections;
    this.totalCollections = count;
  }

  public setIsEditing = (isEditing: boolean): void => {
    this.isEditing = isEditing;
  };

  public setIsOpenDiscardModal = (isOpenDiscardModal: boolean): void => {
    this.isOpenDiscardModal = isOpenDiscardModal;
  };

  public setManageMode = (
    isManageMode: boolean,
    isCollectionDetailPage?: boolean
  ): void => {
    if (isCollectionDetailPage && this.isManageMode && this.isEditing) {
      this.setIsOpenDiscardModal(true);
      return;
    }
    this.isManageMode = isManageMode;
  };

  public setIsManagePermission = (isManagePermission: boolean): void => {
    this.isManagePermission = isManagePermission;
  };

  public resetCollection = (): void => {
    this.collection = null;
    this.overviewCollection = null;
  };
}

export default CollectionStore;
