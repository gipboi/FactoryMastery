import { DocumentTypeService } from "../services/document-type.services.js";

async function get(req, res, next) {
  const documentTypeService = new DocumentTypeService();
  await documentTypeService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const documentTypeService = new DocumentTypeService();
  await documentTypeService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const documentTypeService = new DocumentTypeService();
  await documentTypeService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const documentTypeService = new DocumentTypeService();
  await documentTypeService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const documentTypeService = new DocumentTypeService();
  await documentTypeService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const documentTypeService = new DocumentTypeService();
  await documentTypeService.deleteById(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
};
