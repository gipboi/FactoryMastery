import { BlockService } from "../services/block.services.js";

async function get(req, res, next) {
  const blockService = new BlockService();
  await blockService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const blockService = new BlockService();
  await blockService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const blockService = new BlockService();
  await blockService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const blockService = new BlockService();
  await blockService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const blockService = new BlockService();
  await blockService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const blockService = new BlockService();
  await blockService.deleteById(req, res, next);
  next();
}

async function upsertMedia(req, res, next) {
  const blockService = new BlockService();
  await blockService.upsertMedia(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  upsertMedia,
};
