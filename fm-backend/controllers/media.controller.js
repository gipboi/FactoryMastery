import { MediaService } from "../services/media.services.js";

async function get(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.deleteById(req, res, next);
  next();
}

async function dropMediaType(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.dropMediaType(req, res, next);
  next();
}

async function createManyMedias(req, res, next) {
  const mediaService = new MediaService();
  await mediaService.createManyMedias(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  dropMediaType,
  createManyMedias,
};
