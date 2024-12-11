import { ProcessService } from "../services/process.services.js";

async function get(req, res, next) {
  const processService = new ProcessService();
  await processService.get(req, res, next);
  next();
}

async function getProcessesByAggregate(req, res, next) {
  const processService = new ProcessService();
  await processService.getProcessesByAggregate(req, res, next);
  next();
}

async function aggregateCountProcesses(req, res, next) {
  const processService = new ProcessService();
  await processService.getProcessesByAggregate(req, res, next);
  next();
}

async function create(req, res, next) {
  const processService = new ProcessService();
  await processService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const processService = new ProcessService();
  await processService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const processService = new ProcessService();
  await processService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const processService = new ProcessService();
  await processService.deleteById(req, res, next);
  next();
}

async function getDetailById(req, res, next) {
  const processService = new ProcessService();
  await processService.getDetailById(req, res, next);
  next();
}

async function upsertProcessTags(req, res, next) {
  const processService = new ProcessService();
  await processService.upsertProcessTags(req, res, next);
  next();
}

async function shareProcessToUsers(req, res, next) {
  const processService = new ProcessService();
  await processService.shareProcessToUsers(req, res, next);
  next();
}

async function duplicateProcess(req, res, next) {
  const processService = new ProcessService();
  await processService.duplicateProcess(req, res, next);
  next();
}

async function archiveProcess(req, res, next) {
  const processService = new ProcessService();
  await processService.archiveProcess(req, res, next);
  next();
}

async function restoreProcess(req, res, next) {
  const processService = new ProcessService();
  await processService.restoreProcess(req, res, next);
  next();
}

export default {
  get,
  getProcessesByAggregate,
  aggregateCountProcesses,
  create,
  findById,
  updateById,
  deleteById,
  getDetailById,
  upsertProcessTags,
  shareProcessToUsers,
  duplicateProcess,
  archiveProcess,
  restoreProcess,
};
