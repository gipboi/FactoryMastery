export interface ICollection {
  id?: string;
  name?: string;
  organizationId?: string;
  mainMedia?: string;
  overview?: string;
  public?: boolean;
  archived?: boolean;
  isVisible?: boolean;
  archivedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
