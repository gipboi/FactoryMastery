import { SupportMessageThreadService } from "../services/supportMessageThread.services.js";

async function get(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.deleteById(req, res, next);
  next();
}

async function getSupportMessages(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.getSupportMessages(req, res, next);
  next();
}

async function createSupportMessages(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.createSupportMessages(req, res, next);
  next();
}

async function markSupportMessageThreadAsSeen(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.markSupportMessageThreadAsSeen(req, res, next);
  next();
}

async function getStatusHistory(req, res, next) {
  const supportMessageThreadService = new SupportMessageThreadService();
  await supportMessageThreadService.getStatusHistory(req, res, next);
  next();
}


export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  getSupportMessages,
  createSupportMessages,
  markSupportMessageThreadAsSeen,
  getStatusHistory,
};
