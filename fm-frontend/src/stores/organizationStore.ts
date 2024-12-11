import { getOrganizationData } from "API/organization";
import ERRORS from "config/errors";
import { IOrganization } from "interfaces/organization";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { IFilter } from "types/common";
import { getValidArray } from "utils/common";

class OrganizationStore {
  rootStore: RootStore;
  organization: IOrganization | null = null

  isLoading?: boolean | undefined = undefined;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  showLoading(): void {
    this.isLoading = true;
  }

  hideLoading(): void {
    this.isLoading = false;
  }

  setLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  async getOrganizationBySubdomain(subdomain: string) {
    const filter: IFilter<IOrganization> = {
      where: {
        subdomain,
      },
    };

    const organizations: IOrganization[] = await getOrganizationData(filter);

    if (!organizations || getValidArray(organizations).length === 0) {
      throw new Error(ERRORS.ORG_NOT_FOUND);
    }
    this.organization = organizations?.[0];
    return this.organization;
  }
}


export default OrganizationStore