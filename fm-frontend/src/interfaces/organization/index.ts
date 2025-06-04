import { ITheme } from "interfaces/theme";

export interface IOrganization {
  id: string;
  name: string;
  subdomain: string;
  phone?: string;
  license?: string;
  trialExpirationDate?: Date;
  status?: Number;
  role?: string;
  publicProcessUrl?: string;
  image?: string;
  logo?: string;
  dashboardBannerText?: string;
  horizontalLogo?: string;
  welcomeMessageContent?: string;
  welcomeMessageText?: string;
  welcomeMessageImage?: string;
  isLightSideBar?: boolean;
  sidebarIconColor?: string;
  theme?: ITheme;
  isThemeSetting?: boolean;
  isModularProcess?: boolean;
  isReportTool?: boolean;
  isCollectionFeature?: boolean;
  isMarketPlace?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isStandardUserCanAccessUser?: boolean;
  lastSignInAt?: Date;
}
