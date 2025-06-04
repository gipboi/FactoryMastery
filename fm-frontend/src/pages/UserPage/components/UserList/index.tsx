/* eslint-disable max-lines */
import {
  Box,
  Checkbox,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { updateGroupMembers } from "API/groups";
import cx from "classnames";
import CkTable, {
  EAlignEnum,
  IPagination,
  ITableHeader,
} from "components/CkTable";
import dayjs from "dayjs";
import { useStores } from "hooks/useStores";
import difference from "lodash/difference";
import intersection from "lodash/intersection";
import isArray from "lodash/isArray";
import pick from "lodash/pick";
import { observer } from "mobx-react";
import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { primary500 } from "themes/globalStyles";
// import GeneralMessageModal from 'components/GeneralMessageModal'
import { ReactComponent as GroupIcon } from "assets/icons/group.svg";
import { ReactComponent as AccountCancelOutlineIcon } from "assets/icons/ic_account_cancel_outline.svg";
import { ReactComponent as DeleteIcon } from "assets/icons/ic_delete.svg";
import { ReactComponent as DetailIcon } from "assets/icons/ic_detail.svg";
import Avatar from "components/Avatar";
import DeleteDialog from "components/DeleteDialog";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { MemberTypeEnum } from "constants/enums/user";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import { IGroupMember, IUpdateGroupMember } from "interfaces/groups";
import { ITheme } from "interfaces/theme";
import {
  ICreateEditUserRequest,
  IMemberItem,
  IUser,
  IUserDetailForm,
  IUserWithRelations,
} from "interfaces/user";
import routes from "routes";
import { getValidArray } from "utils/common";
import { getFullName, getName } from "utils/user";
import AssignUserModal from "../AssignUserModal";
import { IGroupDetail, IGroupForm } from "../AssignUserModal/contants";
import ActionButton from "./components/ActionButton";
import UserQuickInfoModal from "./components/UserQuickInfoModal";
import UserTypeTag from "./components/UserTypeTag";
import { IUserListProps } from "./constants";
import styles from "./userList.module.scss";
import {
  ETableHeader,
  getDefaultGroupDetails,
  getDefaultGroupIds,
} from "./utils";

const UserList = ({
  enableActionControl,
  openAssignModal,
  toggleAssignModal,
  fetchUserList,
}: IUserListProps) => {
  const { authStore, userStore, groupStore, organizationStore } = useStores();
  const { users, currentUser, numberOfUsers } = userStore;
  const isEditable: boolean =
    currentUser?.authRole !== AuthRoleIdEnum.BASIC_USER;
  const organizationId: string =
    authStore.userDetail?.organizationId ??
    organizationStore.organization?.id ??
    "";
  const [editingUser, setEditingUser] = useState<IUserDetailForm | null>(null);
  const [isDeletedUsers, setIsDeletedUsers] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState(Array(10).fill(false));
  const isCheckedAll = selectedUsers.every(Boolean);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageIndex: number = Number(params.get("page")) || 1;
  const defaultGroupdIds = getDefaultGroupIds(users, selectedUsers);
  const defaultGroupDetails: IGroupDetail[] = getDefaultGroupDetails(
    users,
    selectedUsers
  );
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedUser, setSelectedUser] = useState<IUserWithRelations | null>(
    null
  );
  const [isAssignSingleUser, setIsAssignSingleUser] = useState<boolean>(false);
  const [isOpenGeneralMessageModal, setIsOpenGeneralMessageModal] =
    useState(false);
  const {
    isOpen: isOpenQuickViewModal,
    onOpen: onOpenQuickViewModal,
    onClose: onCloseQuickViewModal,
  } = useDisclosure();

  const listSelectedUser: IUserWithRelations[] =
    getValidArray(users).filter(
      (user: IUserWithRelations, index) => selectedUsers[index]
    ) ?? [];
  const { organization } = organizationStore;
  const currentTheme: ITheme = {};

  useEffect(() => {
    return () => {
      userStore.clearStore();
      groupStore.resetStore();
    };
  }, []);

  useEffect(() => {
    if (isArray(selectedUsers)) {
      const hasUserSelected = selectedUsers.some((user: boolean) => user);
      enableActionControl(hasUserSelected);
    }
  }, [selectedUsers]);

  function gotoPage(newPage: number) {
    params.set("page", `${newPage}`);
    navigate(`${routes.users.value}?${params.toString()}`);
  }

  const pagination: IPagination = {
    gotoPage: gotoPage,
    // includePagination: true,
    // limit: LIMIT_PAGE_BREAK,
    pageIndex,
    tableLength: numberOfUsers,
  };
  async function handleDeleteUserConfirmed(): Promise<void> {
    await Promise.all(
      getValidArray(listSelectedUser).map((user: IUserWithRelations) => {
        if (user?.id) {
          return userStore.updateUser(user.id, { disabled: true });
        }
        return null;
      })
    ).then(fetchUserList);
    setSelectedUsers(Array(pageSize).fill(false));
    setIsDeletedUsers(false);
  }

  async function handleEditUser(values: IUserDetailForm): Promise<void> {
    if (editingUser?.id) {
      setEditingUser(null);
      try {
        const updatingUserData: ICreateEditUserRequest = {
          ...pick(values, "fullName", "email"),
          authRole: values?.userType ?? AuthRoleNameEnum.BASIC_USER,
          groups: getValidArray(values?.groupPermissions).map((group) => ({
            groupId: group?.groupId,
            admin: group?.admin,
          })),
        };
        await userStore.updateUser(editingUser?.id, updatingUserData);
        await fetchUserList();
        toast.success("Update user successfully!");
      } catch (error: any) {
        toast.error(
          error?.message ??
            "Failed to update user. Please try again or contact support."
        );
      }
    }
  }

  async function handleAssignGroupToUser(values: IGroupForm): Promise<void> {
    const adminRoles: string[] = getValidArray(authStore.authRoles).filter(
      (name: AuthRoleNameEnum) =>
        name === AuthRoleNameEnum.ORG_ADMIN || name === AuthRoleNameEnum.MANAGER
    );
    let listDefaultGroupsId: string[] = isAssignSingleUser
      ? getValidArray(selectedUser?.groupMembers).map(
          (member: IGroupMember) => member.groupId
        )
      : defaultGroupdIds;
    const groupIds: string[] = getValidArray(values.groupDetails).map(
      (groupDetail: IGroupDetail) => groupDetail.groupId
    );
    const sharedGroupIds = intersection(listDefaultGroupsId, groupIds);
    const removedGroupIds = difference(listDefaultGroupsId, sharedGroupIds);
    const addedGroupIds = difference(groupIds, sharedGroupIds);

    const members: IMemberItem[] = isAssignSingleUser
      ? [
          {
            admin: adminRoles.includes(selectedUser?.authRole!),
            userId: selectedUser?.id!,
            memberType: MemberTypeEnum.USER,
          },
        ]
      : listSelectedUser.map(({ authRole, id }: IUser) => {
          const isAdmin: boolean = adminRoles.includes(authRole!);
          const member = {
            admin: isAdmin,
            userId: id!,
            memberType: MemberTypeEnum.USER,
          };
          return member;
        });

    const addedGroupMembers: IGroupMember[] = getValidArray(members)
      .map((member) => {
        if (isAssignSingleUser) {
          return getValidArray([...sharedGroupIds, ...addedGroupIds]).map(
            (groupId) => {
              return {
                ...member,
                groupId,
                permission:
                  (
                    getValidArray(values.groupDetails).find(
                      (groupDetail: IGroupDetail) =>
                        groupDetail.groupId === groupId
                    ) as any
                  )?.permission ?? GroupMemberPermissionEnum.VIEWER,
              };
            }
          );
        }
        return getValidArray(addedGroupIds).map((groupId) => {
          return {
            ...member,
            groupId,
          };
        });
      })
      .flat();

    const toUpdateGroupMember: IUpdateGroupMember = {
      userIds: getValidArray(members).map(({ userId }) => userId),
      toRemoveGroupIds: removedGroupIds,
      toCreateGroupMembers: addedGroupMembers,
    };

    try {
      if (toUpdateGroupMember?.userIds.length > 0) {
        await toast.promise(updateGroupMembers(toUpdateGroupMember), {
          pending:
            "Assign users to group and update search index, please wait...",
          success: "Assign users to group successfully!",
          error:
            "Failed to assign users to group. Please try again or contact support.",
        });
        toggleAssignModal();
      }
    } catch (error: any) {
      toast.error(
        error?.message ??
          "Failed to assign users to group. Please try again or contact support."
      );
    } finally {
      setTimeout(() => {
        fetchUserList();
      }, 1000);
    }
  }

  useEffect(() => {
    fetchUserList();
  }, [pageSize, params.toString(), isEditable]);

  useEffect(() => {
    fetchUserList();
    if (organizationId) {
      groupStore.getGroups({ where: { organizationId } });
    }
    authStore.fetchauthRoles();
  }, [organizationId]);

  useEffect(() => {
    params.set("pageSize", `${pageSize}`);
    navigate(`${routes.users.value}?${params.toString()}`);
  }, [pageSize]);

  const dataInTable = getValidArray<IUserWithRelations>(users).map(
    (user: IUserWithRelations, index: number) => {
      const fullName: string = getFullName(user.firstName, user.lastName);
      const avatarUrl = user?.image;
      let role = AuthRoleNameEnum.BASIC_USER;
      if (user?.authRole === AuthRoleNameEnum.ORG_ADMIN) {
        role = AuthRoleNameEnum.ORG_ADMIN;
      } else if (user?.authRole === AuthRoleNameEnum.MANAGER) {
        role = AuthRoleNameEnum.MANAGER;
      }
      return {
        ...user,
        checkbox: (
          <>
            {userStore?.isManageMode && (
              <Checkbox
                id={`select${index}`}
                isChecked={selectedUsers[index]}
                paddingLeft={2}
                display="flex"
                margin={0}
                onChange={() => {
                  selectedUsers[index] = !selectedUsers[index];
                  setSelectedUsers([...selectedUsers]);
                }}
              />
            )}
          </>
        ),
        name: (
          <HStack>
            <Avatar
              src={avatarUrl}
              name={getName(user)}
              className={styles.avatar}
            />
            <Text
              className={cx(styles.pointer, {
                [styles.disabledLabel]: user?.disabled,
              })}
              margin={0}
              _hover={{
                cursor: "pointer",
                color: currentTheme?.primaryColor ?? primary500,
              }}
              onClick={() => {
                userStore.setManageModeInUserDetail(false);
                navigate(routes.users.userId.value(String(user?.id)));
              }}
            >
              {fullName ?? user?.username ?? "N/A"}
            </Text>
          </HStack>
        ),
        email: (
          <Text
            className={cx({
              [styles.disabledLabel]: user?.disabled,
            })}
            margin={0}
          >
            {user.email}
          </Text>
        ),
        type: <UserTypeTag role={role} disabled={user?.disabled} />,
        lastLogin: (
          <Text
            className={cx({
              [styles.disabledLabel]: user?.disabled,
            })}
            margin={0}
          >
            {user?.lastSignInAt
              ? dayjs(user.lastSignInAt).format("MM/DD/YYYY")
              : ""}
          </Text>
        ),
        actions: (
          <span className={styles.actionGroup}>
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
                icon={<DetailIcon width={20} height={20} />}
                onClick={() => {
                  setSelectedUser(user as IUserWithRelations);
                  onOpenQuickViewModal();
                }}
              />
            </Tooltip>
            {userStore?.isManageMode && (
              <Tooltip
                label="Assign User"
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
                  icon={<GroupIcon width={20} height={20} />}
                  onClick={() =>
                    handleAssignSingleUser(user as IUserWithRelations)
                  }
                />
              </Tooltip>
            )}
          </span>
        ),
      };
    }
  );

  function getHeaderList(): ITableHeader[] {
    const headers: ITableHeader[] = [
      {
        Header: () => {
          return (
            <span className={styles.checkbox}>
              {userStore?.isManageMode && (
                <Checkbox
                  id="selectAll"
                  isChecked={isCheckedAll}
                  isIndeterminate={
                    selectedUsers?.some((item) => item) && !isCheckedAll
                  }
                  onChange={() =>
                    setSelectedUsers(Array(pageSize).fill(!isCheckedAll))
                  }
                />
              )}
            </span>
          );
        },
        accessor: ETableHeader.CHECKBOX,
        width: 4,
        align: EAlignEnum.CENTER,
      },
      {
        Header: () => {
          return <span className={styles.tableName}>Name</span>;
        },
        accessor: ETableHeader.NAME,
      },
      {
        Header: "Email",
        accessor: ETableHeader.EMAIL,
      },
      {
        Header: "Type",
        accessor: ETableHeader.TYPE,
      },
      {
        Header: "Last Login",
        accessor: ETableHeader.LAST_LOGIN,
      },
      {
        Header: (userStore.isManageMode
          ? () => {
              return (
                <>
                  <ActionButton
                    label="Assign"
                    rightIcon={
                      <GroupIcon width={16} height={16} />
                    }
                    disabled={!selectedUsers?.some((item) => item)}
                    onClick={() => {
                      setIsAssignSingleUser(false);
                      toggleAssignModal();
                    }}
                  />
                  {listSelectedUser.some(
                    (user: IUserWithRelations) => !user.disabled
                  ) || listSelectedUser.length === 0 ? (
                    <ActionButton
                      label="Disable"
                      rightIcon={
                        <AccountCancelOutlineIcon width={16} height={16} />
                      }
                      disabled={checkCanDisableDeleteUser()}
                      onClick={() => handleDisableEnableUsers(true)}
                    />
                  ) : (
                    <ActionButton
                      label="Enable"
                      rightIcon={
                        <AccountCancelOutlineIcon width={16} height={16} />
                      }
                      disabled={checkCanDisableDeleteUser()}
                      onClick={() => handleDisableEnableUsers(false)}
                    />
                  )}
                  <ActionButton
                    label="Delete"
                    rightIcon={<DeleteIcon width={16} height={16} />}
                    disabled={checkCanDisableDeleteUser()}
                    onClick={() => setIsDeletedUsers(true)}
                  />
                </>
              );
            }
          : "") as ReactNode,
        accessor: ETableHeader.ACTIONS,
        align: EAlignEnum.RIGHT,
      },
    ];

    return headers;
  }
  function handleOpenAssignMultiUser(): void {
    const currentSelectedUsers: IUserWithRelations[] = getValidArray(
      users
    ).filter((user: IUser, index) => selectedUsers[index]);
    if (getValidArray(currentSelectedUsers).length === 1) {
      setSelectedUser(getValidArray(currentSelectedUsers)?.[0]);
      setIsAssignSingleUser(true);
    } else {
      setIsAssignSingleUser(false);
    }
    toggleAssignModal();
  }
  function handleAssignSingleUser(user: IUserWithRelations): void {
    setSelectedUser(user);
    setIsAssignSingleUser(true);
    toggleAssignModal();
  }
  async function handleDisableEnableUsers(disabled: boolean): Promise<void> {
    await Promise.all(
      getValidArray(listSelectedUser).map((user: IUserWithRelations) => {
        if (user?.id) {
          return userStore.updateUser(user.id, { disabled });
        }
        return null;
      })
    ).then(fetchUserList);
    setSelectedUsers(Array(pageSize).fill(false));
  }
  function checkCanDisableDeleteUser(): boolean {
    return (
      !listSelectedUser?.length ||
      listSelectedUser?.some(
        (user: IUserWithRelations) =>
          user.id === currentUser?.id ||
          user?.authRole !== AuthRoleNameEnum.BASIC_USER
      )
    );
  }

  return (
    <>
      <Box width="full" paddingBottom={6}>
        <CkTable
          headerList={getHeaderList()}
          tableData={dataInTable}
          pagination={pagination}
          pageSize={pageSize}
          setPageSize={setPageSize}
          spacingX={2}
          hasNoSort
        />
      </Box>
      <DeleteDialog
        title="Delete user"
        isOpen={isDeletedUsers}
        message="WARNING: THIS ACTION CANNOT BE UNDONE"
        toggle={() => setIsDeletedUsers(!isDeletedUsers)}
        onDelete={handleDeleteUserConfirmed}
        onCancel={() => setIsDeletedUsers(false)}
      />
      <AssignUserModal
        defaultValues={{ groupDetails: defaultGroupDetails }}
        user={selectedUser as IUserWithRelations}
        isAssignSingleUser={isAssignSingleUser}
        isOpen={openAssignModal}
        toggle={toggleAssignModal}
        onSubmit={handleAssignGroupToUser}
      />
      <UserQuickInfoModal
        user={selectedUser as IUserWithRelations}
        isOpen={isOpenQuickViewModal}
        toggle={() =>
          isOpenQuickViewModal
            ? onCloseQuickViewModal()
            : onOpenQuickViewModal()
        }
        setOpenEditModal={onOpenQuickViewModal}
        setOpenMessageModal={setIsOpenGeneralMessageModal}
      />
      {/* <GeneralMessageModal
        isOpen={isOpenGeneralMessageModal}
        toggle={() => setIsOpenGeneralMessageModal(!isOpenGeneralMessageModal)}
        recipient={selectedUser as IUserWithRelations}
      /> */}
    </>
  );
};
export default observer(UserList);
