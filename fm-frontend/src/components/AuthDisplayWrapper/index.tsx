import { GroupMemberPermission } from "constants/group";
import { AuthRoleNameEnum } from "constants/user";
import { observer } from "mobx-react";
import { useStores } from "../../hooks/useStores";

interface IAuthDisplayWrapperProps {
  allowedRoles: AuthRoleNameEnum[];
  allowedPermission?: GroupMemberPermission;
  belongingGroupIds?: number[];
  children: React.ReactNode;
}

const AuthDisplayWrapper = (props: IAuthDisplayWrapperProps) => {
  const { allowedRoles, children, allowedPermission, belongingGroupIds } =
    props;
  const { userStore } = useStores();
  const currentUserRole = userStore.currentUser?.authRole;
  let isHidden = false;

  if (
    !Array.isArray(allowedRoles) ||
    allowedRoles.length === 0 ||
    !currentUserRole
  ) {
    isHidden = true;
  } else {
    isHidden = !allowedRoles.some(
      (role) => currentUserRole.toLowerCase() === role.toLowerCase()
    );
  }

  if (
    !isHidden &&
    !!allowedPermission &&
    currentUserRole === AuthRoleNameEnum.BASIC_USER
  ) {
    const userGroupMembers = Array.isArray(userStore.currentUserGroupMembers)
      ? userStore.currentUserGroupMembers.filter((groupMember) =>
          belongingGroupIds?.includes(Number(groupMember.groupId))
        )
      : [];
    if (userGroupMembers.length === 0) {
      isHidden = true;
    } else {
      isHidden =
        allowedPermission === GroupMemberPermission.EDITOR &&
        !userGroupMembers.some((groupMember) => !!groupMember.admin);
    }
  }

  return isHidden ? null : <>{children}</>;
};

export default observer(AuthDisplayWrapper);
