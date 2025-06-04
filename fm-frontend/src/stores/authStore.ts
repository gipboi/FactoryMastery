import { login } from 'API/auth';
import { getUserInfo } from 'API/auth';
import ERRORS from 'config/errors';
import { SUPER_ADMIN_DOMAIN } from 'constants/admin';
import { AuthenticateParams } from 'constants/enums/auth';
import { AuthRoleNameEnum } from 'constants/user';
import { AuthUserProfile, ILoginRequest } from 'interfaces/auth';
import { IOrganization } from 'interfaces/organization';
import { IUser } from 'interfaces/user';
import { isEmpty, trim } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { RootStore } from 'stores';
import { isValidEmail } from 'utils/common';
import { getSubdomain } from 'utils/domain';

export default class AuthStore {
  rootStore: RootStore;
  userDetail: AuthUserProfile | null = null;
  accessToken: string = '';
  resetPasswordToken?: string = '';
  isDisabled: boolean = false;
  authRoles: AuthRoleNameEnum[] = [];

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  public async login(
    email: string,
    password: string,
    organization?: IOrganization
  ): Promise<boolean> {
    const currentOrg =
      this.rootStore.organizationStore.organization ?? organization;
    if (isEmpty(currentOrg)) {
      return false;
    }
    const isEmail = isValidEmail(trim(email));

    if (!isEmail) {
      return false;
    }

    try {
      const loginData: ILoginRequest = {
        email: trim(email),
        password,
        organizationId: currentOrg?.id ?? 0,
      };
      const loginResp = await login(loginData);

      this.isDisabled = loginResp?.user?.disabled ?? false;
      if (loginResp?.user?.disabled) {
        return false;
      }

      if (loginResp?.user.isResetPassword) {
        this.resetPasswordToken = loginResp?.user?.resetPasswordToken ?? '';
        return false;
      }

      this.accessToken = loginResp?.user?.tokens ?? '';
      localStorage.setItem(AuthenticateParams.ACCESS_TOKEN, this.accessToken);
      // const groupMembers = await getLoggedInUserGroupMembers();

      // this.rootStore.groupStore.setGroupMembers(groupMembers);

      // this.rootStore.userStore.setCurrentUserGroupMembers(groupMembers);
      this.rootStore.userStore.setCurrentUser(loginResp?.user as IUser);

      const storageOrg: string =
        localStorage.getItem(AuthenticateParams.ORG_ID) ?? '';

      if (
        loginResp?.user?.organizationId !== currentOrg?.id &&
        loginResp?.user?.organizationId !== storageOrg
      ) {
        throw new Error();
      }

      this.userDetail = loginResp?.user;

      this.rootStore.userStore.getUserDetail(
        loginResp?.user?.id ?? loginResp?.user?._id ?? '',
        {
          include: [
            {
              relation: 'groupMembers',
              scope: { include: [{ relation: 'group' }] },
            },
          ],
        }
      );
      return true;
    } catch (e: any) {
      localStorage.removeItem(AuthenticateParams.ACCESS_TOKEN);
      if (e?.status === 403) {
        throw e;
      }
      throw new Error(ERRORS.LOGIN_FAILED);
    }
  }

  public async getMyUser() {
    const accessToken: string =
      localStorage.getItem(AuthenticateParams.ACCESS_TOKEN) || '';
    if (accessToken) {
      this.accessToken = accessToken;
      try {
        const userInfo = await getUserInfo();
        const subDomain = getSubdomain();
        if (userInfo) {
          if (
            subDomain === SUPER_ADMIN_DOMAIN &&
            userInfo.authRole !== AuthRoleNameEnum.SUPER_ADMIN
          ) {
            throw new Error('Access denied');
          }
          this.userDetail = userInfo;
          await this.rootStore.groupStore.fetchGroupMemberOfCurrentUser();
          this.rootStore.userStore.setCurrentUserGroupMembers(
            this.rootStore.groupStore.groupMembers
          );
          this.rootStore.userStore.setCurrentUser(userInfo as IUser);
        }
      } catch (error: any) {
        alert('Login session expired!');
        this.logout();
      }
    }
  }

  public async setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    localStorage.setItem(AuthenticateParams.ACCESS_TOKEN, accessToken);
  }

  public logout(): void {
    localStorage.removeItem(AuthenticateParams.ACCESS_TOKEN);
    const subdomain = getSubdomain();
    const mainhost = window.location.host
      .replace(/^(www\.)/, '')
      .replace(new RegExp(`^(${subdomain}\\.)`), '');
    window.location.href = `${window.location.protocol}//app.${mainhost}`;
    this.resetPasswordToken = undefined;
  }

  public async fetchauthRoles(): Promise<void> {
    this.authRoles = Object.values(AuthRoleNameEnum);
  }
}
