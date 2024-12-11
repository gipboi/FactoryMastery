import { api } from "API";
import { PaginationList } from "interfaces";
import { IProcessFilter, IProcessWithRelations } from "interfaces/process";
import {
  ICreateEditUserRequest,
  IEditEditUserRequest,
  IUpdateUserPermission,
  IUser,
  IUserWithRelations,
} from "interfaces/user";
import { IAdminChangePasswordDTO } from "types/auth";
import { IFilter, Where } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { createCrudService } from "API/crud";
import { createAdditionalCrudService } from "API/additionalCrud";
const userCrudService = createCrudService<IUser, IUser>("users");
const userAdditionalCrudService = createAdditionalCrudService<IUser, IUser>(
  "users"
);

export async function getUserById(
  userId: string,
  filter: IFilter<IUser> = {}
): Promise<IUserWithRelations> {
  return userCrudService.getDetail(userId, filter);
}

export async function createUser(
  user: IUser | ICreateEditUserRequest
): Promise<IUser> {
  return userCrudService.create(user);
}

export async function updateUserById(
  id: string,
  updatedUser: IEditEditUserRequest
): Promise<IUser> {
  return userCrudService.update(id, updatedUser);
}

export async function getUsers(filter: IFilter<IUser> = {}): Promise<IUser[]> {
  return userCrudService.get(filter);
}

export async function deleteUserById(id: string): Promise<void> {
  return userCrudService.delete(id);
}

export async function countUsers(where: Where<IUser> = {}): Promise<number> {
  return userAdditionalCrudService.count("total", where);
}

export async function updateUserPermissionById(
  userId: string,
  data: IUpdateUserPermission
): Promise<void> {
  return userAdditionalCrudService.patch(
    `${userId}/permission`,
    data
  ) as Promise<void>;
}

export async function getShareProcess(
  filter: Pick<IProcessFilter, "groupIds" | "userId" | "organizationId">
): Promise<IProcessWithRelations[]> {
  return userAdditionalCrudService.post("processes/share", filter) as Promise<
    IProcessWithRelations[]
  >;
}

export async function shareProcesses(
  userId: string,
  processIds: string[]
): Promise<void> {
  return userAdditionalCrudService.post(`${userId}/share-processes`, {
    processIds,
  }) as Promise<void>;
}

export async function unshareProcesses(
  userId: string,
  processId: string
): Promise<void> {
  return userAdditionalCrudService.post(`${userId}/unshare-processes`, {
    processId,
  }) as Promise<void>;
}

export async function validatePassword(
  userId: string,
  password: string
): Promise<boolean> {
  return userAdditionalCrudService.post(`${userId}/validate-password`, {
    password,
  }) as Promise<boolean>;
}

export async function getUsersByAggregate(
  pipeline: AggregationPipeline = []
): Promise<PaginationList<IUser>> {
  return userAdditionalCrudService.aggregate(pipeline) as Promise<
    PaginationList<IUser>
  >;
}

export async function adminChangePassword(
  data: IAdminChangePasswordDTO
): Promise<boolean> {
  const result = await api.post("/admin/change-password", data);
  return result.data;
}
