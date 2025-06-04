import { GroupMessageThreadService } from "../services/groupMessageThread.services.js";

async function get(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.deleteById(req, res, next);
  next();
}

async function createGroupMessage(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.createGroupMessage(req, res, next);
  next();
}

async function getGeneralMessages(req, res, next) {
  const groupMessageThreadService = new GroupMessageThreadService();
  await groupMessageThreadService.getGeneralMessages(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  createGroupMessage,
  getGeneralMessages
};
