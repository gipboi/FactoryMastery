import {
  Divider,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { handleError } from "API";
import { deleteGroupById } from "API/groups";
import { ReactComponent as BlackCollectionIcon } from "assets/icons/black_collection.svg";
import { ReactComponent as DuplicateIcon } from "assets/icons/duplicate.svg";
import { ReactComponent as EditIcon } from "assets/icons/edit-icon.svg";
import { ReactComponent as DetailIcon } from "assets/icons/ic_detail.svg";
import { ReactComponent as ShowMoreIcon } from "assets/icons/show-more-icon.svg";
import { ReactComponent as TrashRedIcon } from "assets/icons/trash-red.svg";
import { ReactComponent as UserIcon } from "assets/icons/user.svg";
import Avatar from "components/Avatar";
import CkTable, { IPagination } from "components/CkTable";
import DeleteDialog from "components/DeleteDialog";
import { DATE_FORMAT } from "constants/common/date";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import { IGroup, IGroupMember } from "interfaces/groups";
import truncate from "lodash/truncate";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";
import { getValidArray } from "utils/common";
import CreateModal from "./components/CreateModal";
import DetailModal from "./components/DetailModal";
import DuplicateModal from "./components/DuplicateModal";
import GroupFilterDialog from "./components/GroupFilterDialog";
import Header from "./components/Header";
import { getGroupsPipeline } from "./query";
import styles from "./styles.module.scss";
import { getHeaderList } from "./utils";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";
import { ECollectionFilterName } from "pages/CollectionsPage/components/FilterModal/contants";

const GroupPage = () => {
  const [pageSize, setPageSize] = useState<number>(20);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const params = new URLSearchParams();
  const pageIndex: number = Number(query.get("page")) || 1;
  const sortBy: string = query.get("sortBy") || "name";
  const userIds: string[] =
    (query.get("users") || "").split(",").filter(Boolean).map(String) || [];
  const collectionIds: string[] =
    (query.get("collections") || "").split(",").filter(Boolean).map(String) ||
    [];
  const { groupStore, spinnerStore, authStore, userStore } = useStores();
  const { groups, groupMembers } = groupStore;
  const { userDetail } = authStore;
  const { currentUser } = userStore;
  const isBasicUser: boolean =
    currentUser?.authRole === AuthRoleNameEnum.BASIC_USER;
  const [keyword, setKeyword] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);
  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate,
  } = useDisclosure();
  const {
    isOpen: isOpenDetail,
    onOpen: onOpenDetail,
    onClose: onCloseDetail,
  } = useDisclosure();
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();
  const {
    isOpen: isOpenDuplicate,
    onOpen: onOpenDuplicate,
    onClose: onCloseDuplicate,
  } = useDisclosure();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  function gotoPage(newPage: number) {
    query.set("page", `${newPage}`);
    navigate(`${routes.groups.value}?${query.toString()}`);
  }

  async function fetchData(): Promise<void> {
    try {
      spinnerStore.showLoading();
      const organizationId = userDetail?.organizationId ?? "";
      const isBasicUser: boolean =
        userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
      const dataQuery = getGroupsPipeline(
        organizationId,
        pageSize,
        pageSize * (pageIndex - 1),
        keyword,
        false,
        sortBy,
        isBasicUser ? (userDetail?.id ? [userDetail?.id] : []) : userIds,
        collectionIds
      );
      const countingQuery = getGroupsPipeline(
        organizationId,
        pageSize,
        pageSize * (pageIndex - 1),
        keyword,
        true,
        sortBy,
        isBasicUser ? (userDetail?.id ? [userDetail?.id] : []) : userIds,
        collectionIds
      );
      groupStore.getGroupListByAggregate(dataQuery, countingQuery);
      spinnerStore.hideLoading();
    } catch (error: any) {
      handleError(
        error as Error,
        "components/pages/GroupPage/index.tsx",
        "fetchData"
      );
    }
  }

  function reloadData(): void {
    setKeyword("");
    gotoPage(0);
    fetchData();
  }

  async function handleDeleteGroupConfirmed(): Promise<void> {
    if (selectedGroup?.id) {
      try {
        await deleteGroupById(selectedGroup?.id);
        toast.success("Delete group successfully");
        reloadData();
      } catch (error: any) {
        toast.error("Delete group failed");
      } finally {
        setSelectedGroup(null);
        onCloseDelete();
      }
    }
  }

  useEffect(() => {
    if (!isOpenEdit && userDetail?.organizationId) {
      fetchData();
    }
  }, [
    keyword,
    pageSize,
    pageIndex,
    userDetail?.organizationId,
    isOpenEdit,
    collectionIds?.join(","),
    userIds?.join(","),
    sortBy,
  ]);

  const pagination: IPagination = {
    pageIndex,
    tableLength: groupStore?.totalGroupsCount,
    gotoPage,
  };

  const dataInTable = getValidArray<any>(groups ?? []).map((group) => {
    const foundGroupMember: IGroupMember | undefined = getValidArray(
      groupMembers
    ).find((groupMember) => groupMember.groupId === group.id);
    const isEditorOfGroup: boolean =
      !isBasicUser ||
      (!!foundGroupMember &&
        foundGroupMember?.permission == GroupMemberPermissionEnum.EDITOR);
    function openMembersInGroup() {
      if (group?.id) {
        navigate(`${routes.groups.groupId.value(`${group?.id}`)}`);
      }
    }
    function openCollectionInGroup() {
      if (group?.id) {
        params.set(ECollectionFilterName.GROUPS, String(group.id));
        navigate(`${routes.collections.value}?${params.toString()}`);
      }
    }
    return {
      ...group,
      icon: <Avatar name={group?.name} className={styles.avatar} />,
      name: (
        <Text
          onClick={() => {
            setSelectedGroup(group as IGroup);
            onOpenDetail();
          }}
          // _hover={{ color: currentTheme?.primaryColor ?? primary }}
          margin={0}
        >
          {group?.name ?? "N/A"}
        </Text>
      ),
      description: truncate(group?.description ?? "", {
        length: 55,
        omission: "...",
      }),
      createdAt: dayjs(group?.createdAt).format(DATE_FORMAT),
      numberOfMembers: (
        <Text
          // color={currentTheme?.primaryColor ?? "primary.500"}
          color={"primary.500"}
          _hover={{ opacity: 0.8 }}
          onClick={openMembersInGroup}
        >{`${group?.numberOfMembers ?? 0} members`}</Text>
      ),
      numberOfCollections: (
        <Text
          // color={currentTheme?.primaryColor ?? "primary.500"}
          color={"primary.500"}
          _hover={{ opacity: 0.8 }}
          onClick={openCollectionInGroup}
        >{`${group?.numberOfCollections ?? 0} collections`}</Text>
      ),
      actions: (
        <HStack>
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
              variant="ghost"
              colorScheme="#F7FAFC"
              aria-label="Call Segun"
              className={styles.iconButton}
              icon={<DetailIcon width={16} height={16} />}
              onClick={() => {
                setSelectedGroup(group as IGroup);
                onOpenDetail();
              }}
            />
          </Tooltip>
          {groupStore.isManageMode && (
            <Menu>
              <MenuButton
                as={IconButton}
                className={styles.menuIcon}
                aria-label="Options"
                icon={<ShowMoreIcon width={16} height={16} />}
              />
              <MenuList className={styles.menuList}>
                {isEditorOfGroup && (
                  <MenuItem
                    border="none"
                    onClick={() => {
                      setSelectedGroup(group);
                      onOpenEdit();
                    }}
                    icon={<EditIcon width={16} height={16} />}
                  >
                    Edit group
                  </MenuItem>
                )}
                <MenuItem
                  border="none"
                  icon={<UserIcon width={16} height={16} />}
                  onClick={openMembersInGroup}
                >
                  View all members
                </MenuItem>
                {/* <MenuItem
                  border="none"
                  icon={<BlackCollectionIcon width={16} height={16} />}
                  onClick={openCollectionInGroup}
                >
                  View all collections
                </MenuItem> */}
                {isEditorOfGroup && (
                  <MenuItem
                    border="none"
                    icon={<DuplicateIcon width={16} height={16} />}
                    onClick={() => {
                      setSelectedGroup(group);
                      onOpenDuplicate();
                    }}
                  >
                    Duplicate group
                  </MenuItem>
                )}
                {isEditorOfGroup && (
                  <MenuItem
                    border="none"
                    alignSelf="center"
                    icon={<TrashRedIcon />}
                    onClick={() => {
                      setSelectedGroup(group);
                      onOpenDelete();
                    }}
                  >
                    <p className={styles.delete}>Delete group</p>
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
        </HStack>
      ),
    };
  });

  return (
    <div className={styles.groupPageContainer}>
      <Header
        keyword={keyword}
        setGroupKeyword={setKeyword}
        onOpenCreate={onOpenCreate}
        onOpenFilter={() => setShowFilterDialog(true)}
      />

      <Divider border="1px solid rgba(76, 77, 94, 0.1)" margin="24px 0" />

      {/* Table data */}
      <div>
        <CkTable
          headerList={getHeaderList()}
          tableData={dataInTable}
          pagination={pagination}
          pageSize={pageSize}
          setPageSize={setPageSize}
          hasNoSort
          // TODO: Integrate later
          // setSort={setSort}
          // setOrderBy={setOrderBy}
        />
      </div>

      <GroupFilterDialog
        isOpen={showFilterDialog}
        toggle={() => setShowFilterDialog(!showFilterDialog)}
        onApplyFilter={() => setShowFilterDialog(false)}
      />

      <CreateModal
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        reloadData={reloadData}
      />

      {selectedGroup && (
        <CreateModal
          isOpen={isOpenEdit}
          group={selectedGroup}
          onClose={onCloseEdit}
          reloadData={reloadData}
        />
      )}
      {selectedGroup && (
        <DetailModal
          onOpenEditModal={onOpenEdit}
          isOpen={isOpenDetail}
          group={selectedGroup}
          onClose={onCloseDetail}
        />
      )}
      {selectedGroup && (
        <DuplicateModal
          isOpen={isOpenDuplicate}
          groupToDuplicateFrom={selectedGroup}
          reloadData={reloadData}
          onClose={onCloseDuplicate}
        />
      )}

      <DeleteDialog
        title="Delete group"
        isOpen={isOpenDelete}
        message="Are you sure you want to DELETE this group?"
        toggle={() => {
          onOpenDelete();
        }}
        onDelete={handleDeleteGroupConfirmed}
        onCancel={() => {
          setSelectedGroup(null);
          onCloseDelete();
        }}
      />
    </div>
  );
};

export default observer(GroupPage);
