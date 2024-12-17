import createError from "http-errors";
import Notification from "../schemas/notification.schema.js";
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
} from "../utils/index.js";

export class NotificationService {
  constructor() {}

  async get(req, res, next) {
    try {
      let filter = req?.query?.filter || {};
      if (typeof filter === "string") {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const { keyword, ...whereFilter } = filter?.where;

      const dataPromise = Notification.find({
        ...whereFilter,
      });

      if (filter?.offset || filter?.skip) {
        dataPromise.skip(filter?.offset || filter?.skip);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise
        .sort({
          createdAt: -1,
        })
        .populate(populateOptions);
      const formattedData = getValidArray(data).map((n) =>
        this.formatNotification(n)
      );

      successHandler(res, formattedData, "Get Notifications Successfully");
    } catch (error) {
      handleError(next, error, "services/notification.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Notification.aggregate(pipeline);

      successHandler(res, data, "Get Notifications Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/notification.services.js",
        "getByAggregation"
      );
    }
  }

  async create(req, res, next) {
    try {
      let notificationData = req?.body;
      const currentUserId = req?.auth?._id;
      notificationData = await this.validateNotification(notificationData);

      const createdNotification = await Notification.create({
        ...notificationData,
        createdBy: currentUserId,
      });

      successHandler(
        res,
        createdNotification,
        "Create Notification Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/notification.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { notificationId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentNotification = await Notification.findOne({
        _id: notificationId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentNotification, "Get Notification Successfully");
    } catch (error) {
      handleError(next, error, "services/notification.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { notificationId } = req.params;
      let notificationData = req?.body;

      const currentNotification = await Notification.findOne({
        _id: notificationId,
      });

      if (!currentNotification) {
        throw createError(404, "Notification not found");
      }

      const updatedNotification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
        },
        notificationData
      );

      successHandler(
        res,
        updatedNotification,
        "Update Notification Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/notification.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { notificationId } = req.params;
      await Notification.deleteOne({
        _id: notificationId,
      });

      successHandler(res, {}, "Delete Notification Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/notification.services.js",
        "deleteById"
      );
    }
  }

  async seenAll(req, res, next) {
    try {
      const currentUserId = req?.auth?._id;
      await Notification.updateMany(
        { userId: currentUserId },
        { isSeen: true }
      );

      successHandler(res, {}, "Seen All Notifications Successfully");
    } catch (error) {
      handleError(next, error, "services/notification.services.js", "seenAll");
    }
  }

  async validateNotification(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistNotification(id) {
    const foundNotification = await Notification.findOne({
      _id: id,
    });

    if (foundNotification) {
      throw createError(403, "Notification already exist");
    }
  }

  formatNotification(notification) {
    const formattedNotification = JSON.parse(JSON.stringify(notification));
    if (formattedNotification?.author?.length) {
      formattedNotification.author = formattedNotification?.author?.[0];
    }
    if (formattedNotification?.process?.length) {
      formattedNotification.process = formattedNotification?.process?.[0];
    }
    if (formattedNotification?.step?.length) {
      formattedNotification.step = formattedNotification?.step?.[0];
    }

    return formattedNotification;
  }
}
