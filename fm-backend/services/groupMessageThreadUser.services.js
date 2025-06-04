import GroupMessageThreadUser from '../schemas/groupMessageThreadUser.schema.js';
import {
  handleError,
  successHandler,
} from '../utils/index.js';

export class GroupMessageThreadUserService {
  constructor() {}

  async createBatch(req, res, next) {
    try {
      let groupMessageThreadUserData = req?.body;

      const { userIds = [], groupThreadId } = groupMessageThreadUserData;
      const newData = await Promise.all(
        userIds.map((userId) =>
          GroupMessageThreadUser.create({ userId, groupThreadId })
        )
      );

      successHandler(
        res,
        newData,
        'Create GroupMessageThreadUsers Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/groupMessageThreadUser.services.js',
        'create'
      );
    }
  }
}
