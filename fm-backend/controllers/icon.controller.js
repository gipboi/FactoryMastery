import { IconService } from "../services/icon.services.js";

async function get(req, res, next) {
  const iconService = new IconService();
  await iconService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const iconService = new IconService();
  await iconService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const iconService = new IconService();
  await iconService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const iconService = new IconService();
  await iconService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const iconService = new IconService();
  await iconService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const iconService = new IconService();
  await iconService.deleteById(req, res, next);
  next();
}

async function updateIconPositionBatch(req, res, next) {
  const iconService = new IconService();
  await iconService.updateIconPositionBatch(req, res, next);
  next();
}

async function assignDefault(req, res, next) {
  const iconService = new IconService();
  await iconService.assignDefault(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  updateIconPositionBatch,
  assignDefault,
};
