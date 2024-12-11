import { GroupMemberPermissionEnum } from "constants/enums/group";

export type IGroupOption = {
  admin?: boolean;
  permission?: GroupMemberPermissionEnum;
  groupId: string;
};
