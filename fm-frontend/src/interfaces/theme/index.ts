import { IOrganization } from "interfaces/organization";

export interface ITheme {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  name?: string;
  organizationId?: string;
}

export interface IThemeWithRelations extends ITheme {
  organization?: IOrganization;
}
