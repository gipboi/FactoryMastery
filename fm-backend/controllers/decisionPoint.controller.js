import { DecisionPointService } from "../services/decision-point.services.js";

async function get(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.deleteById(req, res, next);
  next();
}

async function createMany(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.createMany(req, res, next);
  next();
}

async function drop(req, res, next) {
  const decisionPointService = new DecisionPointService();
  await decisionPointService.drop(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  createMany,
  drop,
};
