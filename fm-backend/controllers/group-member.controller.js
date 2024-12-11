import { GroupMemberService } from "../services/group-member.services";

async function addGroupMembers(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.addGroupMembers(req, res, next);
  next();
}

async function getGroupMembersByAggregate(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.getGroupMembersByAggregate(req, res, next);
  next();
}

async function get(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.get(req, res, next);
  next();
}

async function create(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.create(req, res, next);
  next();
}

async function findById(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.findById(req, res, next);
  next();
}

async function updateById(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.updateById(req, res, next);
  next();
}

async function deleteById(req, res, next) {
  const groupMemberService = new GroupMemberService();
  await groupMemberService.deleteById(req, res, next);
  next();
}

export default {
  addGroupMembers,
  getGroupMembersByAggregate,
  get,
  create,
  findById,
  updateById,
  deleteById,
};
