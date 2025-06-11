import createError from 'http-errors';
import Icon from '../schemas/icon.schema.js';
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
} from '../utils/index.js';
import { UserService } from './user.services.js';
import Notification from '../schemas/notification.schema.js';
import {
  NotificationTitleEnum,
  NotificationTypeEnum,
} from '../constants/enums/notification.enum.js';
import DocumentType from '../schemas/documentType.schema.js';
import { EIconDefaultId, EIconType } from '../constants/enums/icon.enum.js';
import Step from '../schemas/step.schema.js';
import Block from '../schemas/block.schema.js';

export class IconService {
  userService;

  constructor() {
    this.userService = new UserService();
  }

  async get(req, res, next) {
    try {
      let filter = req?.query?.filter || {};
      if (typeof filter === 'string') {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const dataPromise = Icon.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, 'Get Icons Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'get');
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Icon.aggregate(pipeline);

      successHandler(res, data, 'Get Icons Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'getByAggregation');
    }
  }

  async create(req, res, next) {
    try {
      let iconData = req?.body;
      const currentUserId = req?.auth?._id;
      const organizationId = req?.auth?.organizationId;

      iconData = await this.validateIcon({ ...iconData, organizationId });

      const createdIcon = await Icon.create({
        ...iconData,
        createdBy: currentUserId,
      });

      successHandler(res, createdIcon, 'Create Icon Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'create');
    }
  }

  async findById(req, res, next) {
    try {
      const { iconId } = req.params;
      const filter = JSON.parse(req.query.filter || '{}');

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentIcon = await Icon.findOne({
        _id: iconId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentIcon, 'Get Icon Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'findById');
    }
  }

  async updateById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { iconId } = req.params;
      let iconData = req?.body;

      const currentIcon = await Icon.findOne({
        _id: iconId,
      });

      if (!currentIcon) {
        throw createError(404, 'Icon not found');
      }

      const updatedIcon = await Icon.findOneAndUpdate(
        {
          _id: iconId,
        },
        iconData,
        { new: true }
      );

      if (updatedIcon.processId) {
        const listRelatedUser =
          await this.userService.getListUserRelatedWithProcess(
            updatedIcon.processId
          );

        Promise.all(
          getValidArray(listRelatedUser).map((user) => {
            return Notification.create({
              processId: updatedIcon.processId,
              iconId,
              organizationId: organizationId,
              type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
              title: NotificationTitleEnum.UPDATED_STEP_NOTIFICATION,
              userId: user,
              createdBy: _id,
            });
          })
        );
      }

      successHandler(res, updatedIcon, 'Update Icon Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'updateById');
    }
  }

  async deleteById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { iconId } = req.params;

      const icon = await Icon.findOne({
        _id: iconId,
      });
      await Icon.deleteOne({
        _id: iconId,
      });

      if (icon.processId) {
        const listRelatedUser =
          await this.userService.getListUserRelatedWithProcess(icon.processId);

        Promise.all(
          getValidArray(listRelatedUser).map((user) => {
            return Notification.create({
              processId: icon.processId,
              iconId,
              organizationId: organizationId,
              type: NotificationTypeEnum.DELETED_STEP_NOTIFICATION,
              title: NotificationTitleEnum.DELETED_STEP_NOTIFICATION,
              userId: user,
              createdBy: _id,
              deletedName: icon?.name || '',
            });
          })
        );
      }

      successHandler(res, {}, 'Delete Icon Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'deleteById');
    }
  }

  async assignDefault(req, res, next) {
    try {
      const { iconId: id } = req.params;

      const defaultIcons = await Icon.find({
        isDefaultIcon: true,
      });
      const icon = await Icon.findOne({ _id: id });

      if (icon?.type === EIconType.DOCUMENT_TYPE) {
        await DocumentType.updateMany(
          {
            iconId: id,
          },
          {
            $set: {
              iconId:
                defaultIcons?.find(
                  (icon) => icon?.type === EIconType.DOCUMENT_TYPE
                )?.id ?? '',
            },
          }
        );
      } else if (icon?.type === EIconType.STEP) {
        await Step.updateMany(
          {
            iconId: id,
          },
          {
            $set: {
              iconId:
                defaultIcons?.find((icon) => icon?.type === EIconType.STEP)
                  ?.id ?? '',
            },
          }
        );
      } else if (icon?.type === EIconType.BLOCK) {
        await Block.updateMany(
          {
            iconId: id,
          },
          {
            $set: {
              iconId:
                defaultIcons?.find((icon) => icon?.type === EIconType.BLOCK)
                  ?.id ?? '',
            },
          }
        );
      }
      await Icon.deleteOne({
        _id: id,
      });

      successHandler(res, {}, 'Delete Icon Successfully');
    } catch (error) {
      handleError(next, error, 'services/icon.services.js', 'assignDefault');
    }
  }

  async validateIcon(data) {
    if (!data?.organizationId) {
      throw createError(400, 'Organization Id is required');
    }
    return data;
  }

  async validateExistIcon(id) {
    const foundIcon = await Icon.findOne({
      _id: id,
    });

    if (foundIcon) {
      throw createError(403, 'Icon already exist');
    }
  }
}
