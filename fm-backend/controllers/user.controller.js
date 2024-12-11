import { UserService } from "../services/user.services.js";

async function getUser(req, res, next) {
  const userService = new UserService();
  await userService.getUser(req, res, next);
  next();
}

async function getUserById(req, res, next) {
  const userService = new UserService();
  await userService.getUserById(req, res, next);
  next();
}

async function findUser(req, res, next) {
  const userService = new UserService();
  await userService.findUser(req, res, next);
  next();
}

// POST
async function create(req, res, next) {
  const userService = new UserService();
  await userService.create(req, res, next);
  next();
}

// GET
async function findById(req, res, next) {
  const userService = new UserService();
  await userService.findById(req, res, next);
  next();
}

// PUT
async function updateById(req, res, next) {
  const userService = new UserService();
  await userService.updateById(req, res, next);
  next();
}

// DELETE
async function deleteById(req, res, next) {
  const userService = new UserService();
  await userService.deleteById(req, res, next);
  next();
}

async function getUsersByAggregate(req, res, next) {
  const userService = new UserService();
  await userService.getUsersByAggregate(req, res, next);
  next();
}

async function countUsers(req, res, next) {
  const userService = new UserService();
  await userService.countUsers(req, res, next);
  next();
}

async function changePassword(req, res, next) {
  const userService = new UserService();
  await userService.changePassword(req, res, next);
  next();
}

async function validatePassword(req, res, next) {
  const userService = new UserService();
  await userService.validatePassword(req, res, next);
  next();
}

async function shareProcesses(req, res, next) {
  const userService = new UserService();
  await userService.shareProcesses(req, res, next);
  next();
}

async function unshareProcesses(req, res, next) {
  const userService = new UserService();
  await userService.unshareProcesses(req, res, next);
  next();
}

export default {
  getUser,
  getUserById,
  findUser,
  create,
  findById,
  updateById,
  deleteById,
  getUsersByAggregate,
  countUsers,
  changePassword,
  validatePassword,
  shareProcesses,
  unshareProcesses,
};
