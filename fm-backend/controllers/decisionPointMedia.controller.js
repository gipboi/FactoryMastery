import { DecisionPointMediaService } from "../services/decision-point-media.services.js";

async function get(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.get(req, res, next);
  next();
}

async function create(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.deleteById(req, res, next);
  next();
}

async function createMany(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.createMany(req, res, next);
  next();
}

async function drop(req, res, next) {
  const decisionPointMediaService = new DecisionPointMediaService();
  await decisionPointMediaService.drop(req, res, next);
  next();
}

export default {
  get,
  create,
  findById,
  updateById,
  deleteById,
  createMany,
  drop,
};
