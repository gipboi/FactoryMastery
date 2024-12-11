import { AuthRoleIdEnum } from "constants/user";

export const roleOptions = [
  {
    label: "Organization Admin",
    value: AuthRoleIdEnum.ORG_ADMIN,
  },
  {
    label: "Admin",
    value: AuthRoleIdEnum.MANAGER,
  },
  {
    label: "Basic User",
    value: AuthRoleIdEnum.BASIC_USER,
  },
];

export function getRoleName(value: AuthRoleIdEnum): string {
  const role = roleOptions.find((option) => option.value === value);
  if (role) {
    return role.label;
  }
  return "Basic User";
}
