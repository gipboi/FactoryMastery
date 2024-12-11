import { OrganizationService } from "../services/organization.services.js";

async function find(req, res, next) {
  const organizationService = new OrganizationService();
  await organizationService.find(req, res, next);
  next();
}

// POST
async function create(req, res, next) {
  const organizationService = new OrganizationService();
  await organizationService.create(req, res, next);
  next();
}

// PUT
async function updateById(req, res, next) {
  const organizationService = new OrganizationService();
  await organizationService.updateById(req, res, next);
  next();
}

// DELETE
async function deleteById(req, res, next) {
  const organizationService = new OrganizationService();
  await organizationService.deleteById(req, res, next);
  next();
}

export default { find, create, updateById, deleteById };
