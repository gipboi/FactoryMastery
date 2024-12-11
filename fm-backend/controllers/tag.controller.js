import { TagService } from "../services/tag.services.js";

async function get(req, res, next) {
  const tagService = new TagService();
  await tagService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const tagService = new TagService();
  await tagService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const tagService = new TagService();
  await tagService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const tagService = new TagService();
  await tagService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const tagService = new TagService();
  await tagService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const tagService = new TagService();
  await tagService.deleteById(req, res, next);
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
