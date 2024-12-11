import { Button, HStack } from "@chakra-ui/react";
import { GroupMemberPermissionEnum } from "constants/enums/group";
import { AuthRoleNameEnum } from "constants/user";
import { useStores } from "hooks/useStores";
import { ITheme } from "interfaces/theme";
import { get } from "lodash";
import { observer } from "mobx-react";
import { ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getValidArray } from "utils/common";

interface IHeaderBarProps {
  title: string | ReactNode;
  setIsManageMode?: (isManageMode: boolean) => void;
  isManageMode?: boolean;
  hasManageMode?: boolean;
  controlBy?:
    | "processDetail"
    | "searchPage"
    | "collectionPage"
    | "collectionDetailPage"
    | "archivePage"
    | "processList"
    | "groupPage"
    | "groupMemberList"
    | "userPage"
    | "userDetailPage";
}

const HeaderBar = (props: IHeaderBarProps) => {
  const {
    title,
    isManageMode = false,
    setIsManageMode,
    controlBy,
    hasManageMode = true,
  } = props;
  const {
    processStore,
    // searchStore,
    userStore,
    authStore,
    groupStore,
    // commonLibraryStore,
    // collectionStore
  } = useStores();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserGroupMembers, currentUser, userDetail } = userStore;
  const currentTheme: ITheme = {};
  const isBasicUser =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.BASIC_USER;
  const isOrgAdmin: boolean =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.ORG_ADMIN;
  const isManager: boolean =
    authStore?.userDetail?.authRole === AuthRoleNameEnum.MANAGER;
  const isEditor: boolean = currentUserGroupMembers?.some(
    (groupMember) =>
      groupMember?.permission === GroupMemberPermissionEnum.EDITOR
  );
  const userCanManage: boolean = isEditor || !isBasicUser;
  const isManageMyself: boolean =
    String(currentUser?.id) === String(userDetail?.id);

  let showManageButton = false;
  let isManageModeDefault = isManageMode;

  if (!setIsManageMode && controlBy === "processDetail") {
    isManageModeDefault = processStore?.isManageModeInDetail;
    showManageButton = processStore?.canUserEditInProcessDetail;
  }
  if (!setIsManageMode && controlBy === "processList") {
    isManageModeDefault = processStore?.isManageModeInProcessList;
    showManageButton = processStore?.canUserEditInProcessList;
  }
  if (!setIsManageMode && controlBy === "searchPage") {
    // isManageModeDefault = searchStore?.isManageMode;
    // showManageButton = userCanManage;
  }
  if (!setIsManageMode && controlBy === "collectionPage") {
    // isManageModeDefault = collectionStore?.isManageMode;
    // showManageButton = userCanManage;
  }
  if (!setIsManageMode && controlBy === "collectionDetailPage") {
    // isManageModeDefault = collectionStore?.isManageMode;
    // if (isEditor) {
    //   showManageButton = isManagePermission;
    // } else {
    //   showManageButton = userCanManage;
    // }
  }
  if (!setIsManageMode && controlBy === "archivePage") {
    // isManageModeDefault = processStore?.isManageModeInArchive;
    // showManageButton = userCanManage;
  }
  if (!setIsManageMode && controlBy === "groupMemberList") {
        const groupId: string = location.pathname.split("/").pop() ?? "";
    const userHasEditorRole: boolean =
      getValidArray(groupStore.groupMembers).some(
        (groupMember) =>
          groupMember?.permission !== GroupMemberPermissionEnum.VIEWER &&
          groupMember.groupId === groupId
      ) || !isBasicUser;

    isManageModeDefault = groupStore?.isManageModeInMemberList;
    showManageButton = userCanManage && userHasEditorRole;
  }
  if (!setIsManageMode && controlBy === "groupPage") {
    isManageModeDefault = groupStore?.isManageMode;
    showManageButton = userCanManage;
  }
  if (!setIsManageMode && controlBy === "userPage") {
    isManageModeDefault = userStore?.isManageMode;
    showManageButton = !isBasicUser;
  }
  if (!setIsManageMode && controlBy === "userDetailPage") {
    // *INFO: ORG_ADMIN can edit user detail, but not basic user
    // MANAGER can edit BU and himself
    // BU can edit himself
    const isManagerPermission: boolean =
      isManager &&
      (userDetail?.authRole === AuthRoleNameEnum.BASIC_USER ||
        userDetail?.authRole === AuthRoleNameEnum.MANAGER);
    const canEditUserDetail: boolean =
      isOrgAdmin || isManagerPermission || isManageMyself;

    showManageButton = canEditUserDetail;
  }

  return (
    <HStack display="flex" justifyContent="space-between" width="full">
      <HStack>{title}</HStack>
      {/* {userCanManage && hasManageMode && ( */}
      {(setIsManageMode || (controlBy && showManageButton)) &&
        hasManageMode && (
          <HStack>
            <Button
              background="primary.500"
              color="white"
              _hover={{
                background: currentTheme?.primaryColor ?? "primary.700",
                opacity: currentTheme?.primaryColor ? 0.8 : 1,
              }}
              onClick={() => {
                if (controlBy === "processDetail") {
                  processStore?.setManageModeInDetail(
                    !processStore?.isManageModeInDetail
                  );
                } else if (controlBy === "processList") {
                  processStore?.setManageModeInList(
                    !processStore?.isManageModeInProcessList
                  );
                } else if (controlBy === "searchPage") {
                  // searchStore?.setManageMode(!searchStore?.isManageMode);
                } else if (controlBy === "collectionPage") {
                  // collectionStore?.setManageMode(!collectionStore?.isManageMode);
                } else if (controlBy === "collectionDetailPage") {
                  // collectionStore?.setManageMode(
                  //   !collectionStore?.isManageMode,
                  //   true
                  // );
                } else if (controlBy === "archivePage") {
                  // processStore?.setManageModeInArchive(
                  //   !processStore?.isManageModeInArchive
                  // );
                } else if (controlBy === "groupMemberList") {
                  groupStore?.setManageModeInMemberList(
                    !groupStore?.isManageModeInMemberList
                  );
                } else if (controlBy === "groupPage") {
                  groupStore?.setManageMode(!groupStore?.isManageMode);
                } else if (controlBy === "userPage") {
                  userStore?.setManageMode(!userStore?.isManageMode);
                } else if (controlBy === "userDetailPage") {
                  userStore?.setManageModeInUserDetail(
                    !userStore?.isManageModeInUserDetail
                  );
                } else {
                  setIsManageMode && setIsManageMode(!isManageMode);
                }
              }}
            >
              {isManageModeDefault ? "Done" : "Manage"}
            </Button>
          </HStack>
        )}
    </HStack>
  );
};

export default observer(HeaderBar);
