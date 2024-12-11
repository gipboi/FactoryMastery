import { DecisionPointStepService } from "../services/decision-point-step.services.js";

async function get(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.get(req, res, next);
  next();
}

async function create(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.deleteById(req, res, next);
  next();
}

async function createMany(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.createMany(req, res, next);
  next();
}

async function drop(req, res, next) {
  const decisionPointStepService = new DecisionPointStepService();
  await decisionPointStepService.drop(req, res, next);
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
