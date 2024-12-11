/* eslint-disable max-lines */
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { handleError } from "API";
import { removeGroupMemberById } from "API/groups";
import cx from "classnames";
import Avatar from "components/Avatar";
import CkTable, {
  EAlignEnum,
  IPagination,
  ITableHeader,
} from "components/CkTable";
import DeleteDialog from "components/DeleteDialog";
import SvgIcon from "components/SvgIcon";
import { DATE_FORMAT } from "constants/common/date";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { EBreakPoint } from "constants/theme";
import { AuthRoleNameEnum } from "constants/user";
import dayjs from "dayjs";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IGroupMember } from "interfaces/groups";
import { ITheme } from "interfaces/theme";
import debounce from "lodash/debounce";
import get from "lodash/get";
import { observer } from "mobx-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";
import { primary500 } from "themes/globalStyles";
import { getValidArray } from "utils/common";
import AddMemberModal from "./components/AddMemberModal";
import EditPermissionMemberModal from "./components/EditPermissionMemberModal";
import PermissionTag from "./components/PermissionTag";
import UserQuickInfoModal from "./components/UserQuickInfoModal";
import styles from "./styles.module.scss";
import { ETableHeader, getGroupMemberAggregation } from "./utils";

const GroupUserPage = () => {
  const { groupStore, spinnerStore, authStore, organizationStore, userStore } =
    useStores();
  const { userDetail } = authStore;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const groupId = String(get(params, "groupId", ""));
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<
    string[]
  >([]);
  const query = new URLSearchParams(location.search);
  const isManageMode = groupStore?.isManageModeInMemberList;
  const pageIndex: number = Number(query.get("page")) || 1;
  const [keyword, setKeyword] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedGroupMember, setSelectedGroupMember] =
    useState<IGroupMember | null>(null);
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
    isOpen: isOpenEditMultiple,
    onOpen: onOpenEditMultiple,
    onClose: onCloseEditMultiple,
  } = useDisclosure();
  const {
    isOpen: isOpenAddMember,
    onOpen: onOpenAddMember,
    onClose: onCloseAddMember,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveMember,
    onOpen: onOpenRemoveMember,
    onClose: onCloseRemoveMember,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveMembers,
    onOpen: onOpenRemoveMembers,
    onClose: onCloseRemoveMembers,
  } = useDisclosure();
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.XS);
  const changeName = useCallback(
    debounce((event: { target: { value: string } }) => {
      setKeyword(event?.target?.value ?? "");
      gotoPage(0);
    }, 1000),
    []
  );
  const { organization } = organizationStore;
  const { currentUser } = userStore;
  const { groupMembers } = groupStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const isBasicUser: boolean =
    currentUser?.authRole === AuthRoleNameEnum.BASIC_USER;
  const userHasEditorRole: boolean =
    getValidArray(groupMembers).some(
      (groupMember) =>
        groupMember?.permission !== GroupMemberPermissionEnum.VIEWER &&
        groupMember.groupId === groupId
    ) || !isBasicUser;

  function gotoPage(newPage: number) {
    query.set("page", `${newPage}`);
    navigate(
      `${routes.groups.groupId.value(`${groupId}`)}?${query.toString()}`
    );
  }

  function handleSelectAllMember() {
    if (!selectedGroupMemberIds?.length) {
      setSelectedGroupMemberIds([
        ...getValidArray<IGroupMember>(
          groupStore?.groupMembersDetail ?? []
        ).map((member) => member?.id ?? ""),
      ]);
    } else {
      setSelectedGroupMemberIds([]);
    }
  }

  function getHeaderList(): ITableHeader[] {
    const headers: ITableHeader[] = [
      {
        Header: () => {
          return (
            <span className={styles.checkbox}>
              {isManageMode && (
                <Checkbox
                  isChecked={
                    selectedGroupMemberIds.length ===
                    groupStore?.groupMembersDetail.length
                  }
                  isIndeterminate={
                    selectedGroupMemberIds.length > 0 &&
                    selectedGroupMemberIds.length <
                      groupStore?.groupMembersDetail.length
                  }
                  onChange={handleSelectAllMember}
                />
              )}
            </span>
          );
        },
        accessor: ETableHeader.CHECKBOX,
        width: 4,
      },
      {
        Header: "Name",
        accessor: ETableHeader.NAME,
      },
      {
        Header: "Email",
        accessor: ETableHeader.EMAIL,
      },
      {
        Header: "Permission",
        accessor: ETableHeader.PERMISSION,
      },
      {
        Header: "Last login",
        accessor: ETableHeader.LOGIN,
      },
      {
        Header: (isManageMode
          ? () => {
              return (
                <>
                  <Button
                    rightIcon={<SvgIcon size={16} iconName="edit-icon" />}
                    variant="outline"
                    background="transparent"
                    border="none"
                    borderRadius="8px"
                    color="gray.700"
                    fontWeight={500}
                    fontSize="16px"
                    disabled={!selectedGroupMemberIds.length}
                    lineHeight="24px"
                    className={cx({ [styles.actionHeaderBtn]: isMobile })}
                    _hover={{ background: "whiteAlpha.700" }}
                    _active={{ background: "whiteAlpha.700" }}
                    onClick={onOpenEditMultiple}
                  >
                    {isMobile ? "" : "Edit Permission"}
                  </Button>
                  <Button
                    rightIcon={<SvgIcon size={16} iconName="ic_delete" />}
                    variant="outline"
                    background="transparent"
                    border="none"
                    borderRadius="8px"
                    color="gray.700"
                    fontWeight={500}
                    disabled={!selectedGroupMemberIds.length}
                    className={cx({ [styles.actionHeaderBtn]: isMobile })}
                    fontSize="16px"
                    lineHeight="24px"
                    _hover={{ background: "whiteAlpha.700" }}
                    _active={{ background: "whiteAlpha.700" }}
                    onClick={onOpenRemoveMembers}
                  >
                    {isMobile ? "" : "Remove"}
                  </Button>
                </>
              );
            }
          : "") as ReactNode,
        accessor: ETableHeader.ACTIONS,
        align: isMobile ? EAlignEnum.LEFT : EAlignEnum.RIGHT,
      },
    ];

    return headers;
  }

  function reloadData(): void {
    setKeyword("");
    gotoPage(0);
    fetchData();
  }

  async function fetchData(): Promise<void> {
    try {
      spinnerStore.showLoading();
      groupStore.getGroupMembers(
        getGroupMemberAggregation(
          keyword,
          userDetail?.organizationId ?? "",
          (pageIndex - 1) * pageSize,
          pageSize,
          groupId
        )
      );
      spinnerStore.hideLoading();
    } catch (error: any) {
      handleError(
        error as Error,
        "components/pages/GroupUserPage/index.tsx",
        "fetchData"
      );
    }
  }

  useEffect(() => {
    if (!isOpenEdit && userDetail?.organizationId) {
      fetchData();
    }
  }, [keyword, pageSize, pageIndex, userDetail?.organizationId, isOpenEdit]);

  useEffect(() => {
    groupStore.getGroupDetail(groupId);
  }, []);

  const pagination: IPagination = {
    pageIndex,
    tableLength: groupStore?.numberOfGroupMembers ?? 0,
    gotoPage,
  };

  const dataInTable = getValidArray<IGroupMember>(
    groupStore?.groupMembersDetail ?? []
  ).map((groupMember) => {
    const member = groupMember?.member;
    const memberName = `${member?.firstName ?? ""} ${member?.lastName ?? ""}`;
    const groupMemberId = groupMember?.id ?? "";
    const imageUrl = member?.image;

    return {
      checkbox: (
        <div className={styles.processName}>
          {isManageMode && (
            <span className={styles.checkbox}>
              <Checkbox
                isChecked={selectedGroupMemberIds.includes(groupMemberId)}
                onChange={() => {
                  if (selectedGroupMemberIds.includes(groupMemberId)) {
                    setSelectedGroupMemberIds(
                      selectedGroupMemberIds.filter(
                        (id) => id !== groupMemberId
                      )
                    );
                  } else {
                    setSelectedGroupMemberIds([
                      ...selectedGroupMemberIds,
                      groupMemberId,
                    ]);
                  }
                }}
              />
            </span>
          )}
        </div>
      ),
      email: member?.email ?? "",
      lastSignInAt: !member?.lastSignInAt
        ? ""
        : dayjs(member?.lastSignInAt).format(DATE_FORMAT),
      permission: (
        <PermissionTag
          role={groupMember?.permission ?? GroupMemberPermissionEnum.VIEWER}
        />
      ),
      name: (
        <HStack _hover={{ color: primary500 }}>
          <Avatar name={memberName} src={imageUrl} className={styles.avatar} />
          <div>{memberName ?? ""}</div>
        </HStack>
      ),
      actions: (
        <HStack spacing={2} justifyContent="flex-end">
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
              icon={<SvgIcon size={16} iconName="ic_detail" />}
              _hover={{ background: "gray.100" }}
              onClick={() => {
                setSelectedGroupMember(groupMember!);
                onOpenDetail();
              }}
            />
          </Tooltip>
          {isManageMode && (
            <Menu>
              <MenuButton
                as={IconButton}
                className={styles.menuIcon}
                aria-label="Options"
                icon={<SvgIcon size={16} iconName="show-more-icon" />}
              />
              <MenuList className={styles.menuList}>
                <MenuItem
                  icon={<SvgIcon size={16} iconName="edit-icon" />}
                  onClick={() => {
                    setSelectedGroupMember(groupMember!);
                    onOpenEdit();
                  }}
                  _hover={{ color: "primary.500" }}
                >
                  Edit permission
                </MenuItem>
                <MenuItem
                  icon={<SvgIcon size={16} iconName="ic_delete" />}
                  onClick={() => {
                    setSelectedGroupMember(groupMember!);
                    onOpenRemoveMember();
                  }}
                  _hover={{ color: "red.500" }}
                >
                  Remove member
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      ),
    };
  });

  return (
    <VStack
      spacing={6}
      height="full"
      padding={{ base: 0, md: 6 }}
      paddingTop={8}
    >
      <HStack
        flexDirection={{ base: "row" }}
        width="full"
        spacing={0}
        justifyContent="space-between"
      >
        <InputGroup borderRadius="6px" background="white" width="auto">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            type="search"
            placeholder="Search member in group by username or full name"
            onChange={changeName}
            width={{ base: "100%", md: "450px" }}
          />
        </InputGroup>

        {userHasEditorRole && isManageMode && (
          <Box
            display={{ base: "flex" }}
            justifyContent="flex-end"
            className={styles.boxCreateButton}
          >
            <Button
              paddingY={2}
              paddingX={4}
              outline="unset"
              border="unset"
              color="white"
              gap={{ base: 0, md: 2 }}
              background={currentTheme?.primaryColor ?? "primary.500"}
              _hover={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _active={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _focus={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              onClick={onOpenAddMember}
              borderRadius="6px"
              fontWeight={500}
              fontSize="16px"
              lineHeight="24px"
            >
              {isMobile ? (
                <AddIcon fontSize="12px" />
              ) : (
                <Flex height={6} alignItems="center">
                  <AddIcon fontSize="12px" marginRight="8px" />
                  Add Member
                </Flex>
              )}
            </Button>
          </Box>
        )}
      </HStack>
      <Divider border="1px solid rgba(76, 77, 94, 0.1)" margin={0} />
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
      <AddMemberModal
        isOpen={isOpenAddMember}
        onClose={onCloseAddMember}
        reloadData={reloadData}
      />
      {selectedGroupMember && (
        <UserQuickInfoModal
          selectedMember={selectedGroupMember}
          isOpen={isOpenDetail}
          toggle={onCloseDetail}
        />
      )}
      {selectedGroupMember && (
        <EditPermissionMemberModal
          groupMember={selectedGroupMember}
          isOpen={isOpenEdit}
          onClose={() => {
            onCloseEdit();
            setSelectedGroupMember(null);
          }}
          reloadData={reloadData}
        />
      )}
      {selectedGroupMemberIds.length && (
        <EditPermissionMemberModal
          groupMemberIds={selectedGroupMemberIds}
          isOpen={isOpenEditMultiple}
          onClose={() => {
            onCloseEditMultiple();
            setSelectedGroupMemberIds([]);
          }}
          reloadData={reloadData}
        />
      )}
      {selectedGroupMember && (
        <DeleteDialog
          title="Remove member?"
          isOpen={isOpenRemoveMember}
          message="Are you sure you want to remove this member?"
          toggle={onCloseRemoveMember}
          onDelete={async () => {
            try {
              await removeGroupMemberById(selectedGroupMember?.id ?? "");
              toast.success("Remove member successfully");
              reloadData();
            } catch (error: any) {
              toast.error(`Error when remove member: ${error}`);
            } finally {
              onCloseRemoveMember();
              setSelectedGroupMember(null);
            }
          }}
          onCancel={onCloseRemoveMember}
          confirmText="Remove"
        />
      )}
      {selectedGroupMemberIds.length && (
        <DeleteDialog
          title="Remove member?"
          isOpen={isOpenRemoveMembers}
          message="Are you sure you want to remove these members?"
          toggle={onCloseRemoveMembers}
          onDelete={async () => {
            try {
              await Promise.all(
                selectedGroupMemberIds.map((groupMemberId) =>
                  removeGroupMemberById(groupMemberId ?? 0)
                )
              );
              toast.success("Remove members successfully");
              reloadData();
            } catch (error: any) {
              toast.error(`Error when remove member: ${error}`);
            } finally {
              onCloseRemoveMembers();
              setSelectedGroupMemberIds([]);
            }
          }}
          onCancel={onCloseRemoveMembers}
          confirmText="Remove"
        />
      )}
    </VStack>
  );
};

export default observer(GroupUserPage);
