/* eslint-disable max-lines */
import {
  Button,
  Checkbox,
  HStack,
  IconButton,
  Img,
  SimpleGrid,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {
  archiveCollectionById,
  shareCollectionsToGroups,
} from 'API/collection';
import Icon from 'assets/icons/collections.svg';
import ConfirmModal from 'components/Chakra/ConfirmModal';
import CkTable, {
  EAlignEnum,
  IPagination,
  ITableHeader,
} from 'components/CkTable';
import GlobalSpinner from 'components/GlobalSpinner';
import SvgIcon from 'components/SvgIcon';
import { AuthRoleNameEnum } from 'constants/user';
import dayjs from 'dayjs';
import { useStores } from 'hooks/useStores';
import { ICollection, ICollectionFilter } from 'interfaces/collection';
import set from 'lodash/set';
import trim from 'lodash/trim';
import { observer } from 'mobx-react';
import { ECollectionFilterName } from 'pages/CollectionsPage/components/FilterModal/contants';
import { getItemIds } from 'pages/CollectionsPage/components/FilterModal/utils';
import { ViewMode } from 'pages/CollectionsPage/constants';
import { CollectionListProps } from 'pages/CollectionsPage/types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getValidArray } from 'utils/common';
import CollectionOverview from '../CollectionOverview';
import CollectionsGridItem from '../CollectionsGridItem';
import ShareCollection from '../ShareCollection';
import styles from './styles.module.scss';
import { ITheme } from 'interfaces/theme';
import routes from 'routes';
import { primary500 } from 'themes/globalStyles';

enum ETableHeaderCollectionPage {
  IMAGE = 'image',
  CHECKBOX = 'checkbox',
  NAME = 'name',
  DATE_MODIFIED = 'updatedAt',
  CREATED_BY = 'createdBy',
  ACTIONS = 'actions',
}

const CollectionList = (props: CollectionListProps) => {
  const {
    onItemClick = () => {},
    viewMode = ViewMode.List,
    gotoPage,
    isDraft,
    isManageMode,
    pageSize,
    sort,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const page = Number(params.get('page') || '1');
  const sortBy: string = sort ?? params.get('sortBy') ?? '';
  const groupIds: string[] = getItemIds(params, ECollectionFilterName.GROUPS);
  const processIds: string[] = getItemIds(
    params,
    ECollectionFilterName.PROCESS
  );
  const documentTypeIds: string[] = getItemIds(
    params,
    ECollectionFilterName.PROCESS_DOCUMENT_TYPES
  );
  const creatorIds: string[] = getItemIds(
    params,
    ECollectionFilterName.CREATOR
  );
  const tagIds: string[] = getItemIds(
    params,
    ECollectionFilterName.PROCESS_TAGS
  );
  const modifiedDate: string[] = params.get(
    `${ECollectionFilterName.MODIFIED_DATE}`
  )
    ? params
        .get(`${ECollectionFilterName.MODIFIED_DATE}`)
        ?.split(',')
        ?.map((id: string) => id) ?? []
    : [];
  const search = trim(params.get(ECollectionFilterName.SEARCH) || '');
  const {
    isOpen: isOpenCollection,
    onOpen: onOpenCollection,
    onClose: onCloseCollection,
  } = useDisclosure();
  const {
    isOpen: isOpenShareModal,
    onOpen: onOpenShareModal,
    onClose: onCloseShareModal,
  } = useDisclosure();
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isOpenArchiveModal, setIsOpenArchiveModal] = useState(false);
  const [isOpenBulkShareModal, setOpenBulkShareModal] = useState(false);
  const [selectedViewOnlyCollectionIds, setSelectedViewOnlyCollectionIds] =
    useState<string[]>([]);
  const [selectedCollectionIdList, setSelectedCollectionIdList] = useState<
    string[]
  >([]);
  const totalSelectedItems: number = selectedCollectionIdList.length;
  const isSelectedViewOnlyItems: boolean =
    selectedViewOnlyCollectionIds?.length > 0;
  const { authStore, collectionStore, userStore, groupStore } = useStores();
  const { userDetail } = authStore;
  const { groupMembers } = groupStore;
  const {
    isSearching,
    totalCollections: totalResults,
    isLoading: storeIsLoading,
    collections,
  } = collectionStore;
  const isBasicUser =
    authStore.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const currentUserId: string = userDetail?.id ?? '';
  const isListMode: boolean = viewMode === ViewMode.List;
  const isDisabledArchive = !totalSelectedItems || isSelectedViewOnlyItems;
  const isDisableShare = !totalSelectedItems || isSelectedViewOnlyItems;
  const organizationId: string = authStore.userDetail?.organizationId ?? '';
  const currentTheme: ITheme = {};

  const [items, setItems] = useState<ICollection[]>(collections);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function fetchData(): Promise<void> {
    setIsLoading(true);

    const filterGroup = {
      where: { organizationId },
    };
    if (isBasicUser) {
      set(filterGroup.where, 'id', {
        inq: getValidArray(groupMembers).map(
          (groupMember) => groupMember?.groupId
        ),
      });
    }
    let filter: ICollectionFilter = {
      name: search,
      userId: currentUserId,
      organizationId,
      sortBy,
      groupIds,
      processIds,
      documentTypeIds,
      tagIds,
      creatorIds,
      modifiedDate,
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (isBasicUser) {
      filter = {
        ...filter,
        public: !isDraft,
      };
    }
    userStore.setDefaultUserListFilter(organizationId, 0, 99999);

    await Promise.all([
      groupStore.getGroups(filterGroup),
      collectionStore.fetchCollectionsByFilter(filter),
      userStore.getUsers(userStore.filter),
    ]);

    setItems(collectionStore.collections);
    setIsLoading(false);
  }

  async function handleSelectItem(item: ICollection) {
    const id: string = item?.id ?? '';
    if (!id) return;

    let newArray: string[] = [...selectedCollectionIdList];
    if (newArray.indexOf(id) !== -1) {
      newArray.splice(newArray.indexOf(id), 1);
      setSelectedCollectionIdList(newArray);
      setSelectedViewOnlyCollectionIds(
        selectedViewOnlyCollectionIds.filter(
          (collectionId) => collectionId !== id
        )
      );
    } else {
      setSelectedCollectionIdList([...newArray, id]);
      if (isBasicUser) {
        // const canEdit = await isUserHavePermissionForCollection(
        //   currentUserId,
        //   isBasicUser,
        //   id
        // );
        const canEdit =
          authStore.userDetail?.authRole === AuthRoleNameEnum.MANAGER; //Ask Tien
        if (!canEdit && !selectedViewOnlyCollectionIds.includes(id)) {
          setSelectedViewOnlyCollectionIds([
            ...selectedViewOnlyCollectionIds,
            id,
          ]);
        }
      }
    }
  }

  async function handleArchiveItems() {
    try {
      if (selectedCollectionIdList?.length) {
        await Promise.all(
          [...getValidArray(selectedCollectionIdList)].map((id) =>
            archiveCollectionById(id)
          )
        );
      }
      fetchData();
      setIsOpenArchiveModal(false);
      setSelectedCollectionIdList([]);
      toast.success('Archived collections successfully');
    } catch (error: any) {
      toast.error('Archived collections failed');
    }
  }

  function selectAndOpenShareModal(collection: ICollection): void {
    setSelectedCollectionId(collection?.id ?? '');
    onOpenShareModal();
  }

  function handleCloseShareModal(): void {
    onCloseShareModal();
    setOpenBulkShareModal(false);
  }

  function handleSelectAllItems() {
    if (selectedCollectionIdList?.length === items?.length) {
      setSelectedCollectionIdList([]);
      return;
    }

    const newCollectionIdList: string[] = [];

    items.forEach(async (item) => {
      const id = item?.id ?? '';
      if (!id) return;

      newCollectionIdList.push(id);

      if (isBasicUser) {
        // const canEdit = await isUserHavePermissionForCollection(
        //   currentUserId,
        //   isBasicUser,
        //   id
        // );
        const canEdit =
          authStore.userDetail?.authRole === AuthRoleNameEnum.MANAGER; //Ask Tien
        if (!canEdit && !selectedViewOnlyCollectionIds.includes(id)) {
          setSelectedViewOnlyCollectionIds([
            ...selectedViewOnlyCollectionIds,
            id,
          ]);
        }
      }
    });
    setSelectedCollectionIdList(newCollectionIdList);
  }

  function onImgError(
    evt: React.SyntheticEvent<HTMLImageElement, Event>
  ): void {
    if (evt.currentTarget.src !== Icon) {
      evt.currentTarget.src = Icon;
    }
  }

  function getHeaderList(): ITableHeader[] {
    const headers: ITableHeader[] = [
      {
        Header: '',
        accessor: ETableHeaderCollectionPage.IMAGE,
        width: 20,
      },
      {
        Header: 'Name',
        accessor: ETableHeaderCollectionPage.NAME,
        align: EAlignEnum.LEFT,
      },
      {
        Header: 'Created by',
        accessor: ETableHeaderCollectionPage.CREATED_BY,
        align: EAlignEnum.LEFT,
      },
      {
        Header: 'Last updated',
        accessor: ETableHeaderCollectionPage.DATE_MODIFIED,
        align: EAlignEnum.LEFT,
      },
    ];

    headers.push({
      Header: isManageMode
        ? () => {
            return (
              <>
                {!!totalSelectedItems && (
                  <>
                    <Button
                      rightIcon={<SvgIcon size={16} iconName="ic_share" />}
                      variant="outline"
                      background="transparent"
                      border="none"
                      borderRadius="8px"
                      color="gray.700"
                      fontWeight={500}
                      fontSize="16px"
                      lineHeight="24px"
                      disabled={isDisableShare}
                      _hover={{ background: 'whiteAlpha.700' }}
                      _active={{ background: 'whiteAlpha.700' }}
                      onClick={() => {
                        onOpenShareModal();
                        setOpenBulkShareModal(true);
                      }}
                    >
                      Share
                    </Button>
                    <Tooltip
                      isDisabled={!isDisabledArchive}
                      label="You don't have permission to archive some of the items you have selected"
                      height="56px"
                      fontSize="14px"
                      padding={2}
                      shouldWrapChildren
                      background="gray.700"
                      placement="top"
                      color="white"
                      hasArrow
                      borderRadius="4px"
                    >
                      <Button
                        rightIcon={<SvgIcon size={16} iconName="archive" />}
                        variant="outline"
                        background="transparent"
                        border="none"
                        borderRadius="8px"
                        color="gray.700"
                        fontWeight={500}
                        fontSize="16px"
                        lineHeight="24px"
                        disabled={isDisabledArchive}
                        _hover={{ background: 'whiteAlpha.700' }}
                        _active={{ background: 'whiteAlpha.700' }}
                        onClick={() => {
                          setIsOpenArchiveModal(true);
                        }}
                      >
                        Archive
                      </Button>
                    </Tooltip>
                  </>
                )}
              </>
            );
          }
        : '',
      accessor: ETableHeaderCollectionPage.ACTIONS,
      align: EAlignEnum.RIGHT,
    });

    if (isManageMode) {
      headers.unshift({
        Header: () => {
          return (
            <Checkbox
              isChecked={totalSelectedItems === items.length}
              isIndeterminate={
                totalSelectedItems < items.length && totalSelectedItems > 0
              }
              onChange={() => handleSelectAllItems()}
            ></Checkbox>
          );
        },
        accessor: ETableHeaderCollectionPage.CHECKBOX,
        width: 20,
      });
    }

    return headers;
  }

  function clearSelectedItems() {
    setSelectedCollectionIdList([]);
    setSelectedViewOnlyCollectionIds([]);
  }

  const pagination: IPagination = {
    gotoPage,
    pageIndex: page,
    tableLength: totalResults,
  };

  function handleOpenCollectionModal(item: ICollection): void {
    setSelectedCollectionId(item?.id ?? '');
    onOpenCollection();
  }

  function handleChangePageSize(newPageSize: number): void {
    collectionStore.changeSize(newPageSize);
    gotoPage(1);
  }

  async function onSubmitBulkShare(groupIds: string[]) {
    try {
      if (selectedCollectionIdList?.length) {
        await shareCollectionsToGroups(groupIds, selectedCollectionIdList);
      }
      setSelectedCollectionIdList([]);
      setOpenBulkShareModal(false);
      toast.success('Share collections successfully');
    } catch (error: any) {
      toast.error('Share collections failed');
    }
  }

  const dataInTable = getValidArray<ICollection>(items).map((item) => {
    const id = item?.id ?? '';
    const image = item?.mainMedia ? item?.mainMedia : Icon;
    return {
      ...item,
      image: (
        <Img
          width={10}
          height={10}
          src={image}
          onError={onImgError}
          borderRadius="8px"
        />
      ),
      updatedAt: item?.updatedAt
        ? dayjs(item?.updatedAt).format('MM/DD/YYYY')
        : 'N/A',
      // collectionName: EEsGlobalSearchCollection.COLLECTION,
      name: (
        <HStack>
          <Text
            margin={0}
            _hover={{
              cursor: 'pointer',
              color: currentTheme?.primaryColor ?? primary500,
            }}
            onClick={() => {
              navigate(routes.collections.collectionId.value(String(item.id)));
            }}
          >
            {item?.name ?? 'N/A'}
          </Text>
        </HStack>
      ),
      createdBy: item?.createdBy ?? 'N/A',
      correlationId: id,
      actions: (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Tooltip
            label="Quick view"
            height="36px"
            fontSize="14px"
            padding={2}
            background="gray.700"
            placement="top"
            color="white"
            hasArrow
            borderRadius="4px"
          >
            <IconButton
              variant="transparent"
              colorScheme="#F7FAFC"
              aria-label="Call Segun"
              background="transparent"
              border="none"
              boxShadow="none"
              onClick={() => handleOpenCollectionModal(item)}
              icon={<SvgIcon size={16} iconName="ic_detail" />}
              _hover={{ backgroundColor: '#EDF2F7' }}
            />
          </Tooltip>
          {isManageMode && !isDraft && (
            <>
              <Tooltip
                label="Share"
                height="36px"
                fontSize="14px"
                padding={2}
                background="gray.700"
                placement="top"
                color="white"
                hasArrow
                borderRadius="4px"
              >
                <IconButton
                  variant="transparent"
                  colorScheme="#F7FAFC"
                  aria-label="Call Segun"
                  background="transparent"
                  border="none"
                  boxShadow="none"
                  icon={
                    <SvgIcon
                      width={20}
                      height={20}
                      iconName="ic_share"
                      className={styles.iconShare}
                    />
                  }
                  onClick={() => selectAndOpenShareModal(item)}
                  _hover={{ backgroundColor: '#EDF2F7' }}
                />
              </Tooltip>
            </>
          )}
        </div>
      ),
      checkbox: (
        <Checkbox
          isChecked={selectedCollectionIdList.includes(id)}
          onChange={() => handleSelectItem(item)}
        ></Checkbox>
      ),
    };
  });

  useEffect(() => {
    fetchData();
    authStore.fetchauthRoles();
  }, [organizationId, params.toString()]);

  useEffect(() => {
    if (page === 1) {
      fetchData();
    } else {
      gotoPage(1);
    }
  }, [pageSize]);

  useEffect(() => {
    if (page) {
      clearSelectedItems();
    }
  }, [page]);

  if (isLoading) {
    return <GlobalSpinner />;
  }

  return (
    <VStack
      width="full"
      marginY={6}
      spacing={3}
      paddingTop={6}
      borderTop="2px solid #E2E8F0"
      hidden={getValidArray(items).length === 0}
    >
      {isListMode ? (
        <>
          {isSearching && <GlobalSpinner />}
          <CkTable
            headerList={getHeaderList()}
            tableData={dataInTable}
            pagination={pagination}
            pageSize={pageSize}
            setPageSize={handleChangePageSize}
            hasNoSort
            includePagination={false}
          />
        </>
      ) : (
        <VStack width="full" spacing={6}>
          {isManageMode && !!totalSelectedItems && (
            <HStack
              width="full"
              justify="space-between"
              background="white"
              paddingX={4}
              paddingY={3}
              borderRadius={8}
            >
              <Checkbox
                isChecked={totalSelectedItems === items?.length}
                isIndeterminate={
                  totalSelectedItems < items?.length && totalSelectedItems > 0
                }
                onChange={() => handleSelectAllItems()}
                margin={0}
              />
              <HStack>
                <Button
                  rightIcon={<SvgIcon size={16} iconName="ic_share" />}
                  variant="outline"
                  background="transparent"
                  border="none"
                  color="gray.700"
                  fontWeight={500}
                  fontSize="16px"
                  lineHeight="24px"
                  disabled={isDisableShare}
                  onClick={() => {
                    onOpenShareModal();
                    setOpenBulkShareModal(true);
                  }}
                >
                  Share
                </Button>
                <Tooltip
                  isDisabled={!isDisabledArchive}
                  label="You don't have permission to archive some of the items you have selected"
                  height="56px"
                  fontSize="14px"
                  padding={2}
                  shouldWrapChildren
                  background="gray.700"
                  placement="top"
                  color="white"
                  hasArrow
                  borderRadius="4px"
                >
                  <Button
                    rightIcon={<SvgIcon size={16} iconName="archive" />}
                    variant="outline"
                    background="transparent"
                    border="none"
                    borderRadius="8px"
                    color="gray.700"
                    fontWeight={500}
                    fontSize="16px"
                    lineHeight="24px"
                    disabled={isDisabledArchive}
                    onClick={() => {
                      setIsOpenArchiveModal(true);
                    }}
                  >
                    Archive
                  </Button>
                </Tooltip>
              </HStack>
            </HStack>
          )}
          <SimpleGrid width="full" gap={6} columns={{ base: 1, md: 2, lg: 4 }}>
            {getValidArray(items).map(
              (collection: ICollection, index: number) => (
                <>
                  {!(isBasicUser && collection?.isVisible === false) && (
                    <CollectionsGridItem
                      key={`${collection?.id}-${index}`}
                      collection={collection}
                      isManageMode={isManageMode}
                      isSelected={
                        isManageMode &&
                        selectedCollectionIdList?.includes(collection?.id ?? '')
                      }
                      openShareModal={() => selectAndOpenShareModal(collection)}
                      handleSelectItem={() => handleSelectItem(collection)}
                      onClick={onItemClick}
                    />
                  )}
                </>
              )
            )}
          </SimpleGrid>
          {isSearching && <GlobalSpinner />}
        </VStack>
      )}
      <CollectionOverview
        collectionId={selectedCollectionId}
        isCentered
        toggle={isOpenCollection ? onCloseCollection : onOpenCollection}
        isOpen={isOpenCollection}
      />
      <ShareCollection
        isOpen={isOpenShareModal}
        onClose={handleCloseShareModal}
        collectionId={selectedCollectionId}
        isBasicUser={isBasicUser}
        isBulkShare={isOpenBulkShareModal}
        onSubmitBulkShare={onSubmitBulkShare}
      />
      {isOpenArchiveModal && (
        <ConfirmModal
          titleText="Archive Collection?"
          bodyText="You can find archived items in the Archive page."
          confirmButtonText="Archive"
          isOpen={isOpenArchiveModal}
          onClose={() => setIsOpenArchiveModal(false)}
          onClickAccept={handleArchiveItems}
        />
      )}
    </VStack>
  );
};

export default observer(CollectionList);
