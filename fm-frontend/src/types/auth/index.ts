import { AuthRoleNameEnum } from "constants/user";
import { IGroupMember } from "interfaces/groups";

export interface AuthUserProfile {
  id: number;
  username?: string;
  email?: string;
  authRoleId: AuthRoleNameEnum;
  authRole: AuthRoleNameEnum;
  isEditor?: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  organizationId: number;
  image?: string;
  disabled?: boolean;
  groupMembers: IGroupMember[];
  isReportTool?: boolean;
  isMessageFullAccess?: boolean;
  isResetPassword?: boolean;
  resetPasswordToken?: string;
}

export interface IAdminChangePasswordDTO {
  userId?: string;
  newPassword: string;
}
