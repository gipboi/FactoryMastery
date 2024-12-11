import { StepService } from "../services/step.services.js";

async function get(req, res, next) {
  const stepService = new StepService();
  await stepService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const stepService = new StepService();
  await stepService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const stepService = new StepService();
  await stepService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const stepService = new StepService();
  await stepService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const stepService = new StepService();
  await stepService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const stepService = new StepService();
  await stepService.deleteById(req, res, next);
  next();
}

async function updateStepPositionBatch(req, res, next) {
  const stepService = new StepService();
  await stepService.updateStepPositionBatch(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  updateStepPositionBatch,
};
