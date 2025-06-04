import { GroupMessageThreadUserService } from '../services/groupMessageThreadUser.services.js';

async function createBatch(req, res, next) {
  const groupMessageThreadUserService = new GroupMessageThreadUserService();
  await groupMessageThreadUserService.createBatch(req, res, next);
  next();
}

export default {
  createBatch,
};
