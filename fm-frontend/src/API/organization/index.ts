import { IOrganization } from "interfaces/organization";
import { IFilter } from "types/common";
import { createCrudService } from "API/crud";

const organizationCrudService = createCrudService<IOrganization, IOrganization>(
  "organizations"
);

export async function getOrganizationData(
  filter: IFilter<IOrganization>
): Promise<IOrganization[]> {
  return organizationCrudService.get(filter);
}

export async function updateOrganizationById(
  organizationId: string,
  data: Partial<IOrganization>
): Promise<void> {
  await organizationCrudService.update(organizationId, data);
}
