import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { createUser } from "API/user";
import { EBreakPoint } from "constants/theme";
import { AuthRoleIdEnum, AuthRoleNameEnum } from "constants/user";
import useBreakPoint from "hooks/useBreakPoint";
import { useStores } from "hooks/useStores";
import { IGroupMember } from "interfaces/groups";
import { ICreateEditUserRequest, IUserDetailForm } from "interfaces/user";
import compact from "lodash/compact";
import debounce from "lodash/debounce";
import isNumber from "lodash/isNumber";
import { observer } from "mobx-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "routes";
import { AggregationPipeline } from "types/common/aggregation";
import { getFirstAndLastName } from "utils/user";
import { ReactComponent as SortIcon } from "../../assets/icons/sort.svg";
import { ITheme } from "../../interfaces/theme";
import { primary500 } from "../../themes/globalStyles";
import UserList from "./components/UserList";
import UserDetailModal from "./components/UserList/components/UserDetailModal";
import { getUsersFilterPipeline } from "./components/UserList/query";
import UserListFilterDialog from "./components/UserListFilterDialog";
import styles from "./styles.module.scss";

const UserPage = () => {
  const { userStore, authStore, organizationStore } = useStores();
  const { organization } = organizationStore;
  const { currentUser, numberOfUsers } = userStore;
  const currentTheme: ITheme = {};
  const isEditable: boolean =
    currentUser?.authRole !== AuthRoleIdEnum.BASIC_USER;
  const organizationId: string =
    authStore.userDetail?.organizationId ?? organization?.id ?? "";
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageIndex: number = Number(params.get("page")) || 1;
  const filterRoleIds: string[] =
    params
      .get("user-types")
      ?.split(",")
      ?.map((id: string) => String(id)) ?? [];
  const filterGroupIds: string[] = params.get("groups")
    ? params
        .get("groups")
        ?.split(",")
        ?.map((id: string) => String(id)) ?? []
    : [];
  const filterSortBy: string = params.get("sortBy") ?? "";
  const validRoleIds: string[] = compact(filterRoleIds).filter((role) =>
    Object.values(AuthRoleNameEnum).includes(role as AuthRoleNameEnum)
  ) as AuthRoleNameEnum[];
  const keyword: string = params.get("keyword") || "";
  const [actionEnabled, setActionEnaled] = useState<boolean>(false);
  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);
  const isMobile: boolean = useBreakPoint(EBreakPoint.BASE, EBreakPoint.MD);
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);
  const [showCreateUserDialog, setShowCreateUserDialog] =
    useState<boolean>(false);
  const pageSize: number = Number(params.get("pageSize")) || 10;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isBasicUser: boolean =
    currentUser?.authRole === AuthRoleIdEnum.BASIC_USER;

  function handleChangeKeyword(newKeyword: string) {
    params.set("keyword", `${newKeyword}`);
    params.set("page", "1");
    navigate(`${routes.users.value}?${params.toString()}`);
  }
  const debouncedChangeKeyword = debounce(handleChangeKeyword, 700);
  function enableActionControl(isEnaled: boolean = false) {
    setActionEnaled(isEnaled);
  }
  function toggleAssignModal() {
    setOpenAssignModal((prevOpened: boolean) => !prevOpened);
  }
  async function fetchUserList(): Promise<void> {
    if (isNumber(pageSize) && isNumber(pageIndex) && organizationId) {
      const paginationPipeline: AggregationPipeline = getUsersFilterPipeline(
        authStore.userDetail?.organizationId ?? "",
        pageSize,
        (pageIndex - 1) * pageSize,
        keyword,
        !isEditable,
        filterSortBy,
        validRoleIds,
        filterGroupIds
      );

      await userStore.getUsersByPipeline(paginationPipeline);
    }
  }

  async function handleCreateUser(values: IUserDetailForm): Promise<void> {
    try {
      setIsLoading(true);
      const canEditUserDetail: boolean =
        currentUser?.authRole != AuthRoleNameEnum.BASIC_USER;

      if (!canEditUserDetail) {
        toast.error("Insufficient permission to create user");
        setIsLoading(false);
        return;
      }
      const fullName = values.fullName.trim();
      const { firstName, lastName } = getFirstAndLastName(fullName);
      const newUserData: ICreateEditUserRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
        organizationId,
        firstName,
        lastName,
        authRole: values?.userType ?? AuthRoleNameEnum.BASIC_USER,
        groups:
          Array.isArray(values?.groupPermissions) &&
          values?.userType === AuthRoleNameEnum.BASIC_USER
            ? values?.groupPermissions?.map((group: IGroupMember) => ({
                groupId: group?.groupId,
                permission: group?.permission,
                admin: group?.admin,
              }))
            : [],
      };
      await createUser(newUserData);
      userStore.setDefaultUserListFilter(
        authStore.userDetail?.organizationId ?? "",
        pageIndex,
        pageSize
      );
      await fetchUserList();
      setShowCreateUserDialog(false);
      setIsLoading(false);
      toast.success("Create user successfully!");
    } catch (error: any) {
      setIsLoading(false);
      toast.error(
        error?.response?.data.error.message ??
          "Failed to create user. Please try again or contact support."
      );
    }
  }

  // async function exportUsers(): Promise<any[]> {
  //   const toastId = toast.loading('Exporting users data...')
  //   const users = await userStore.getUsersForExport()
  //   toast.update(toastId, {
  //     render: 'Exported users data successfully!',
  //     type: 'success',
  //     isLoading: false,
  //     autoClose: 1000
  //   })
  //   return exportUsersData(users)
  // }

  return (
    <VStack
      spacing={6}
      height="full"
      padding={{ base: 0, md: 6 }}
      paddingTop={6}
      className={styles.container}
    >
      <HStack
        flexDirection={{ base: "row" }}
        width="full"
        marginTop="0px !important"
        spacing={0}
        justifyContent="space-between"
      >
        <HStack width="full" spacing={4}>
          <InputGroup borderRadius="6px" background="white" width="auto">
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.400" />
            </InputLeftElement>
            <Input
              type="search"
              placeholder="Search user by username or full name"
              width={{ base: "100%", md: "350px" }}
              onChange={(e) => {
                debouncedChangeKeyword(e?.currentTarget?.value ?? "");
              }}
            />
          </InputGroup>
          <Button
            style={{ marginLeft: 16 }}
            backgroundColor="white"
            gap={{ base: 0, md: 2 }}
            border="1px solid #E2E8F0"
            borderRadius="6px"
            cursor="pointer"
            padding={{ base: "10px", md: "16px" }}
            variant="solid"
            className={styles.button}
            onClick={() => setShowFilterDialog(!showFilterDialog)}
          >
            <SortIcon className={styles.icon} />
            <Text
              marginBottom="0"
              fontWeight={500}
              fontSize={{
                base: "0px",
                md: "16px",
              }}
              lineHeight="24px"
              color="gray.700"
            >
              Filter
            </Text>
          </Button>
          {/* {!isBasicUser && (
            <ExportCsvButtonAsync
              text="Export"
              filename={`users-${new Date().toISOString()}.csv`}
              fetchData={exportUsers}
              iconChildren={<DownloadIcon width={16} />}
            />
          )} */}
        </HStack>
        <Box
          display={{ base: "flex" }}
          justifyContent="flex-end"
          className={styles.boxCreateButton}
        >
          {userStore?.isManageMode && (
            <Button
              paddingY={2}
              paddingX={4}
              outline="unset"
              border="unset"
              color="white"
              gap={{ base: 0, md: 2 }}
              backgroundColor={currentTheme?.primaryColor ?? primary500}
              _hover={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _focus={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              _active={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              onClick={() => setShowCreateUserDialog(!showCreateUserDialog)}
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
                  Add User
                </Flex>
              )}
            </Button>
          )}
        </Box>
      </HStack>
      <Divider border="1px solid rgba(76, 77, 94, 0.1)" margin={0} />
      <UserList
        enableActionControl={enableActionControl}
        openAssignModal={openAssignModal}
        toggleAssignModal={toggleAssignModal}
        fetchUserList={fetchUserList}
      />
      <UserListFilterDialog
        isOpen={showFilterDialog}
        toggle={() => setShowFilterDialog(!showFilterDialog)}
        onApplyFilter={() => setShowFilterDialog(false)}
      />
      <UserDetailModal
        isOpen={showCreateUserDialog}
        onClose={() => setShowCreateUserDialog(!showCreateUserDialog)}
        onSubmit={handleCreateUser}
        isLoading={isLoading}
        children={<></>}
      />
    </VStack>
  );
};

export default observer(UserPage);
