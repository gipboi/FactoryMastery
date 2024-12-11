import { NotificationService } from "../services/notification.services.js";

async function get(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.get(req, res, next);
  next();
}

async function getByAggregation(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.getByAggregation(req, res, next);
  next();
}

async function create(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.deleteById(req, res, next);
  next();
}

async function seenAll(req, res, next) {
  const notificationService = new NotificationService();
  await notificationService.seenAll(req, res, next);
  next();
}

export default {
  get,
  getByAggregation,
  create,
  findById,
  updateById,
  deleteById,
  seenAll,
};
