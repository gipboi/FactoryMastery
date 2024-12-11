import { api } from "API";
import { AxiosResponse } from "axios";
import {
  AuthUserProfile,
  ICreateOrganizationAndUserRequest,
  ILoginRequest,
  ILoginResponse,
} from "interfaces/auth";
import { IOrganization } from "interfaces/organization";
import { IUser } from "interfaces/user";

export async function login(login: ILoginRequest): Promise<ILoginResponse> {
  const response = await api.post(`/auth/login`, {
    email: login.email,
    password: login.password,
    organizationId: login.organizationId,
  });
  return response.data?.data as ILoginResponse;
}

export async function signUpOrganization(
  data: ICreateOrganizationAndUserRequest
): Promise<{
  organization: IOrganization;
  user: IUser;
}> {
  const createdOrganization: AxiosResponse = await api.post(
    `/auth/organizations`,
    data
  );
  return createdOrganization.data?.data;
}

export async function getUserInfo(): Promise<AuthUserProfile> {
  const response = await api.get(`/auth/me`);
  return response.data?.data as AuthUserProfile;
}

export async function requestForgotPassword(
  email: string,
  subdomain: string
): Promise<any> {
  const response = await api.post(`/auth/forgot-password`, {
    email,
    subdomain,
  });

  return response.data?.data;
}

export async function resetPassword(data: {
  resetToken: string;
  newPassword: string;
}): Promise<void> {
  await api.post(`/auth/reset-password`, data);
}
