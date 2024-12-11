import {
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { getNumberOfGroupMember, removeGroupMemberById } from "API/groups";
import CkTable from "components/CkTable";
import DeleteDialog from "components/DeleteDialog";
import SearchInput from "components/SearchInput";
import SvgIcon from "components/SvgIcon";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { IGroup, IGroupMember } from "interfaces/groups";
import { ITheme } from "interfaces/theme";
import debounce from "lodash/debounce";
import get from "lodash/get";
import { observer } from "mobx-react";
import DetailModal from "pages/GroupPage/components/DetailModal";
import { useEffect, useState } from "react";
import RAvatar from "react-avatar";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getValidArray } from "utils/common";
import { filter } from "../../constants";
import {
  getHeaderList,
  getPermissionTagBackground,
  getPermissionTagBorder,
  getPermissionTagColor,
  mapPermissionIdToText,
} from "../../utils";
import AssignMemberModal from "../AssignMemberModal";
import EditPermissionMemberModal from "../EditPermissionMemberModal";
import styles from "./styles.module.scss";

const GroupTab = () => {
  const params = useParams();
  const userId = String(get(params, "userId", "") ?? "");

  const { userStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const currentTheme: ITheme = organization?.theme ?? {};
  const { isManageModeInUserDetail, currentUser, userDetail } = userStore;
  const canEditUserDetail: boolean =
    currentUser?.authRole === AuthRoleNameEnum.ORG_ADMIN ||
    currentUser?.authRole !==
      (userDetail?.authRole ?? AuthRoleNameEnum.BASIC_USER);
  const groupMembers = getValidArray(userDetail?.groupMembers);

  const [groupsPagination, setGroupsPagination] = useState<IGroupMember[]>(
    getValidArray(groupMembers)
  );
  const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<IGroupMember | null>(
    null
  );

  const {
    isOpen: isOpenDetail,
    onOpen: onOpenDetail,
    onClose: onCloseDetail,
  } = useDisclosure();
  const {
    isOpen: isOpenAssignModal,
    onOpen: onOpenAssignModal,
    onClose: onCloseAssignModal,
  } = useDisclosure();
  const {
    isOpen: isOpenEditAssignment,
    onOpen: onOpenEditAssignment,
    onClose: onCloseEditAssignment,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveMember,
    onOpen: onOpenRemoveMember,
    onClose: onCloseRemoveMember,
  } = useDisclosure();

  function fetchData() {
    if (!!searchKeyword) {
      const filteredKeyWordGroups = getValidArray(groupMembers).filter(
        (groupMember) => {
          return (groupMember?.group as IGroup[])?.[0]?.name
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase());
        }
      );
      setGroupsPagination(filteredKeyWordGroups);
      return;
    }

    setGroupsPagination(groupMembers);
  }

  const debounceSearchKeyword = debounce((searchText: string) => {
    setSearchKeyword(searchText);
  }, 500);

  async function openGroupDetail(groupMember: IGroupMember): Promise<void> {
    const groupData =
      (groupMember?.group as IGroup[])?.[0] ?? groupMember?.group ?? {};
    const numberOfMembers = await getNumberOfGroupMember(groupMember?.groupId);
    setSelectedGroup({ ...groupData, numberOfMembers } as IGroup);
    onOpenDetail();
  }

  const dataInTable = groupsPagination.map((groupMember) => {
    const groupData =
      (groupMember?.group as IGroup[])?.[0] ?? groupMember?.group ?? {};

    return {
      icon: (
        <RAvatar
          name={groupData?.name}
          className={styles.avatar}
          maxInitials={2}
        />
      ),
      name: groupData?.name,
      description: groupData?.description,
      permission: (
        <Tag
          size="md"
          color={getPermissionTagColor(groupMember?.permission)}
          background={getPermissionTagBackground(groupMember?.permission)}
          border="1px solid"
          borderColor={getPermissionTagBorder(groupMember?.permission)}
        >
          {mapPermissionIdToText(groupMember?.permission)}
        </Tag>
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
              border="none"
              icon={<SvgIcon size={16} iconName="ic_detail" />}
              _hover={{ background: "gray.100" }}
              onClick={() => openGroupDetail(groupMember)}
            />
          </Tooltip>
          {!!isManageModeInUserDetail && canEditUserDetail && (
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
                    setSelectedMember(groupMember);
                    onOpenEditAssignment();
                  }}
                  _hover={{ color: "primary.500" }}
                >
                  Edit permission
                </MenuItem>
                <MenuItem
                  icon={<SvgIcon size={16} iconName="unassign-group.svg" />}
                  onClick={() => {
                    setSelectedMember(groupMember);
                    onOpenRemoveMember();
                  }}
                  _hover={{ color: "red.500" }}
                >
                  Unassign
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      ),
    };
  });

  async function reloadData() {
    await userStore.getUserDetail(userId ?? "", filter);
    userStore.setManageModeInUserDetail(false);
  }

  async function closeAssignModal() {
    onCloseAssignModal();
    setSelectedMember(null);
  }

  async function closeConfirmModal() {
    onCloseRemoveMember();
    setSelectedMember(null);
  }

  useEffect(() => {
    fetchData();
  }, [userDetail, searchKeyword]);

  return (
    <VStack spacing={4} alignItems="left">
      <HStack spacing={4} width="full" justifyContent="space-between">
        <SearchInput
          width={336}
          placeholder="Search group by name"
          onChange={(event) => debounceSearchKeyword(event.target.value)}
        />
        {!!isManageModeInUserDetail && canEditUserDetail && (
          <Button
            variant="primary"
            onClick={() => onOpenAssignModal()}
            gap={{ base: 0, md: 2 }}
            padding={{ base: "10px", md: "16px" }}
            fontSize={{
              base: "0px",
              md: "16px",
            }}
            fontWeight={"normal"}
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
          >
            <Flex height={6} alignItems="center">
              <SvgIcon size={16} iconName="sidebar-group.svg" />
            </Flex>
            Assign to group
          </Button>
        )}
      </HStack>

      <Divider borderBottomWidth={2} color="gray.200" opacity={1} />

      <CkTable
        headerList={getHeaderList()}
        tableData={dataInTable}
        spacingX={4}
        hasNoSort
        hidePagination
      />
      {isOpenAssignModal && (
        <AssignMemberModal
          isOpen={isOpenAssignModal}
          onClose={closeAssignModal}
        />
      )}
      {selectedMember && (
        <EditPermissionMemberModal
          member={selectedMember}
          isOpen={isOpenEditAssignment}
          onClose={onCloseEditAssignment}
          reloadData={() => reloadData()}
        />
      )}
      {selectedMember && (
        <DeleteDialog
          title="Unassign member?"
          isOpen={isOpenRemoveMember}
          message="Are you sure you want to unassign this member?"
          toggle={closeConfirmModal}
          onDelete={async () => {
            try {
              await removeGroupMemberById(selectedMember?.id ?? "");
              toast.success("Unassign member successfully");
              reloadData();
            } catch (error: any) {
              toast.error(`Error when unassign member: ${error}`);
            } finally {
              closeConfirmModal();
            }
          }}
          onCancel={closeConfirmModal}
          confirmText="Unassign"
        />
      )}
      {selectedGroup && (
        <DetailModal
          hideCollection
          isOpen={isOpenDetail}
          group={selectedGroup}
          onClose={onCloseDetail}
        />
      )}
    </VStack>
  );
};

export default observer(GroupTab);
