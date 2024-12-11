import { GroupProcessService } from "../services/group-process.services.js";

async function get(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.deleteById(req, res, next);
  next();
}

async function shareProcessToGroups(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.shareProcessToGroups(req, res, next);
  next();
}

async function shareProcessesToGroups(req, res, next) {
  const groupProcessService = new GroupProcessService();
  await groupProcessService.shareProcessesToGroups(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  shareProcessToGroups,
  shareProcessesToGroups,
};
