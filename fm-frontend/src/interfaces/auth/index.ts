import { AuthRoleNameEnum } from "constants/user";
import { IOrganization } from "interfaces/organization";
import { IUser } from "interfaces/user";

export interface ILoginRequest {
  email: string;
  password: string;
  organizationId: string;
}

export interface ILoginResponse {
  user: AuthUserProfile;
}

export interface AuthUserProfile {
  id?: string;
  username?: string;
  email?: string;
  authRole: AuthRoleNameEnum;
  isEditor?: boolean;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  disabled?: boolean;
  // groupMembers: IGroupMember[]
  isReportTool?: boolean;
  isMessageFullAccess?: boolean;
  isResetPassword?: boolean;
  resetPasswordToken?: string;
  tokens?: string;
  organizationId: string;
  organization?: IOrganization;
}

export interface ISignUpRequest extends IUser {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ICreateOrganizationAndUserRequest {
  userData: ISignUpRequest;
  organization: IOrganization;
}
