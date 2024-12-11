import { GroupService } from "../services/group.services.js";

async function get(req, res, next) {
  const groupService = new GroupService();
  await groupService.get(req, res, next);
  next();
}

async function getGroupsByAggregate(req, res, next) {
  const groupService = new GroupService();
  await groupService.getGroupsByAggregate(req, res, next);
  next();
}

async function aggregateCountGroups(req, res, next) {
  const groupService = new GroupService();
  await groupService.getGroupsByAggregate(req, res, next);
  next();
}

async function create(req, res, next) {
  const groupService = new GroupService();
  await groupService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const groupService = new GroupService();
  await groupService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const groupService = new GroupService();
  await groupService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const groupService = new GroupService();
  await groupService.deleteById(req, res, next);
  next();
}

async function duplicateGroup(req, res, next) {
  const groupService = new GroupService();
  await groupService.duplicateGroup(req, res, next);
  next();
}

async function countMember(req, res, next) {
  const groupService = new GroupService();
  await groupService.countMember(req, res, next);
  next();
}

export default {
  get,
  getGroupsByAggregate,
  aggregateCountGroups,
  create,
  findById,
  updateById,
  deleteById,
  duplicateGroup,
  countMember,
};
