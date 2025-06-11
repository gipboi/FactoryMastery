import createError from "http-errors";
import Organization from "../schemas/organization.schema.js";
import { handleError, successHandler } from "../utils/index.js";
import { convertToSubdomain } from "../utils/organization.js";

export class OrganizationService {
  constructor() {}

  async find(req, res, next) {
    try {
      let filter = JSON.parse(req.query.filter || "{}");

      const foundOrganizations = filter?.where
        ? await Organization.find(filter?.where || {})
        : [];

      successHandler(res, foundOrganizations, "Find Organizations Success");
    } catch (error) {
      handleError(next, error, "services/organization.services.js", "find");
    }
  }

  async create(req, res, next) {
    try {
      let organizationData = req?.body;
      organizationData = await this.validateOrganization(organizationData);

      const createdOrganization = await Organization.create(organizationData);

      successHandler(res, createdOrganization, "Create Organization Success");
    } catch (error) {
      handleError(next, error, "services/organization.services.js", "create");
    }
  }

  async updateById(req, res, next) {
    try {
      const { organizationId } = req.params;
      let organizationData = req?.body;

      const updatedOrganization = await Organization.findOneAndUpdate(
        {
          _id: organizationId,
        },
        organizationData,
        { new: true }
      );

      successHandler(res, updatedOrganization, "Update Organization Success");
    } catch (error) {
      handleError(
        next,
        error,
        "services/organization.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { organizationId } = req.params;
      await Organization.deleteOne({
        _id: organizationId,
      });

      successHandler(res, {}, "Delete Organization Success");
    } catch (error) {
      handleError(
        next,
        error,
        "services/organization.services.js",
        "deleteById"
      );
    }
  }

  async validateOrganization(data) {
    if (!data?.name) {
      throw createError(400, "Organization Name is required");
    }

    if (!data?.subdomain) {
      data.subdomain = convertToSubdomain(data?.name);
    }

    await this.validateExistOrganization(data?.subdomain);

    return data;
  }

  async validateExistOrganization(subdomain) {
    const foundOrganization = await Organization.findOne({
      subdomain,
    });

    if (foundOrganization) {
      throw createError(403, "Organization already exist");
    }
  }
}
