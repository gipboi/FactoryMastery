import { signUpOrganization } from "API/auth";
import { AuthenticateParams } from "constants/enums/auth";
import { AuthRoleNameEnum } from "constants/user";
import { ISignUpRequest } from "interfaces/auth";
import { IOrganization } from "interfaces/organization";
import { IUser } from "interfaces/user";
import { get } from "lodash";
import { toast } from "react-toastify";
import routes from "routes";
import AuthStore from "stores/authStore";
import { SetError } from "types/hookForm";
import { SignUpFormValues } from "../constants";
import { ISignUpForm } from "../types";

export async function handleCreateOrganization(
  setError: SetError,
  authStore: AuthStore,
  formValue: ISignUpForm
): Promise<void> {
  const organization: IOrganization = formatOrganization(formValue);
  const user: IUser = formatUser(formValue);

  const { REACT_APP_PROTOCOL } = process.env;

  try {
    const completedUser: ISignUpRequest = {
      ...user,
      email: formValue.email,
      username: formValue.username,
      firstName: formValue.firstName ?? "",
      lastName: formValue.lastName ?? "",
      password: formValue.password,
    };
    const createdData: {
      organization: IOrganization;
      user: IUser;
    } = await signUpOrganization({
      organization,
      userData: completedUser,
    });

    toast.success(
      "Organization created successfully! Redirecting to dashboard..."
    );
    await authStore.login(
      formValue?.email,
      formValue.password,
      createdData?.organization
    );
    localStorage.setItem(
      AuthenticateParams.ORG_ID,
      createdData?.organization.id?.toString()
    );
    localStorage.setItem(
      AuthenticateParams.USER_SUBDOMAIN,
      organization.subdomain
    );
    const accessToken =
      localStorage.getItem(AuthenticateParams.ACCESS_TOKEN) || "";

    window.location.replace(
      `${REACT_APP_PROTOCOL}://${routes.subdomain.dashboard.value(
        organization.subdomain
      )}?accessToken=${accessToken}`
    );
  } catch (error) {
    setError(SignUpFormValues.SUBMIT, {
      message: "Error while creating organization, please contact us.",
    });
  }
}

export function formatOrganization(formValue: ISignUpForm): IOrganization {
  const organization: IOrganization = {
    name: get(formValue, "organizationName", ""),
    subdomain: get(formValue, "subdomain", ""),
  } as IOrganization;
  return organization;
}

export function formatUser(formValue: ISignUpForm): IUser {
  const user: IUser = {
    email: get(formValue, "email", ""),
    authRole: get(formValue, "userRole.value", AuthRoleNameEnum.ORG_ADMIN),
  };
  return user;
}
