import createError from "http-errors";
import DecisionPointMedia from "../schemas/decisionPointMedia.schema.js";
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from "../utils/index.js";

export class DecisionPointMediaService {
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

      const dataPromise = DecisionPointMedia.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get DecisionPointMedias Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "get"
      );
    }
  }

  async create(req, res, next) {
    try {
      let decisionPointMediaData = req?.body;
      const currentUserId = req?.auth?._id;
      decisionPointMediaData = await this.validateDecisionPointMedia(
        decisionPointMediaData
      );

      const createdDecisionPointMedia = await DecisionPointMedia.create({
        ...decisionPointMediaData,
        createdBy: currentUserId,
      });

      successHandler(
        res,
        createdDecisionPointMedia,
        "Create DecisionPointMedia Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "create"
      );
    }
  }

  async findById(req, res, next) {
    try {
      const { decisionPointMediaId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentDecisionPointMedia = await DecisionPointMedia.findOne({
        _id: decisionPointMediaId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(
        res,
        currentDecisionPointMedia,
        "Get DecisionPointMedia Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "findById"
      );
    }
  }

  async updateById(req, res, next) {
    try {
      const { decisionPointMediaId } = req.params;
      let decisionPointMediaData = req?.body;

      const currentDecisionPointMedia = await DecisionPointMedia.findOne({
        _id: decisionPointMediaId,
      });

      if (!currentDecisionPointMedia) {
        throw createError(404, "DecisionPointMedia not found");
      }

      const updatedDecisionPointMedia =
        await DecisionPointMedia.findOneAndUpdate(
          {
            _id: decisionPointMediaId,
          },
          decisionPointMediaData
        );

      successHandler(
        res,
        updatedDecisionPointMedia,
        "Update DecisionPointMedia Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { decisionPointMediaId } = req.params;
      await DecisionPointMedia.deleteOne({
        _id: decisionPointMediaId,
      });

      successHandler(res, {}, "Delete DecisionPointMedia Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "deleteById"
      );
    }
  }

  async createMany(req, res, next) {
    try {
      const decisionPointMediasData = req?.body;

      const createdDecisionPointMedia = await DecisionPointMedia.insertMany(
        decisionPointMediasData
      );

      successHandler(
        res,
        createdDecisionPointMedia,
        "Create DecisionPointMedias Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "createMany"
      );
    }
  }

  async drop(req, res, next) {
    try {
      const { decisionPointId } = req.body;

      await DecisionPointMedia.deleteMany({
        decisionPointId,
      });

      successHandler(res, {}, "Drop DecisionPointMedias Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-media.services.js",
        "drop"
      );
    }
  }

  async validateDecisionPointMedia(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistDecisionPointMedia(id) {
    const foundDecisionPointMedia = await DecisionPointMedia.findOne({
      _id: id,
    });

    if (foundDecisionPointMedia) {
      throw createError(403, "DecisionPointMedia already exist");
    }
  }
}
