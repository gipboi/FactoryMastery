import createError from "http-errors";
import DecisionPoint from "../schemas/decisionPoint.schema.js";
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from "../utils/index.js";

export class DecisionPointService {
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

      const dataPromise = DecisionPoint.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get DecisionPoints Successfully");
    } catch (error) {
      handleError(next, error, "services/decision-point.services.js", "get");
    }
  }

  async create(req, res, next) {
    try {
      let decisionPointData = req?.body;
      const currentUserId = req?.auth?._id;
      decisionPointData = await this.validateDecisionPoint(decisionPointData);

      const createdDecisionPoint = await DecisionPoint.create({
        ...decisionPointData,
        createdBy: currentUserId,
      });

      successHandler(
        res,
        createdDecisionPoint,
        "Create DecisionPoint Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/decision-point.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { decisionPointId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentDecisionPoint = await DecisionPoint.findOne({
        _id: decisionPointId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(
        res,
        currentDecisionPoint,
        "Get DecisionPoint Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point.services.js",
        "findById"
      );
    }
  }

  async updateById(req, res, next) {
    try {
      const { decisionPointId } = req.params;
      let decisionPointData = req?.body;

      const currentDecisionPoint = await DecisionPoint.findOne({
        _id: decisionPointId,
      });

      if (!currentDecisionPoint) {
        throw createError(404, "DecisionPoint not found");
      }

      const updatedDecisionPoint = await DecisionPoint.findOneAndUpdate(
        {
          _id: decisionPointId,
        },
        decisionPointData
      );

      successHandler(
        res,
        updatedDecisionPoint,
        "Update DecisionPoint Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { decisionPointId } = req.params;
      await DecisionPoint.deleteOne({
        _id: decisionPointId,
      });

      successHandler(res, {}, "Delete DecisionPoint Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point.services.js",
        "deleteById"
      );
    }
  }

  async createMany(req, res, next) {
    try {
      const decisionPoints = req?.body;
      const currentUserId = req?.auth?._id;

      const createdDecisionPoint = await DecisionPoint.create(
        decisionPoints.map((decisionPoint) => ({
          ...decisionPoint,
          createdBy: currentUserId,
        }))
      );

      successHandler(
        res,
        createdDecisionPoint,
        "Create DecisionPoints Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point.services.js",
        "createMany"
      );
    }
  }

  async drop(req, res, next) {
    try {
      const { blockId } = req.body;

      await DecisionPoint.deleteMany({
        blockId,
      });

      successHandler(res, {}, "Drop DecisionPoints Successfully");
    } catch (error) {
      handleError(next, error, "services/decision-point.services.js", "drop");
    }
  }

  async validateDecisionPoint(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistDecisionPoint(id) {
    const foundDecisionPoint = await DecisionPoint.findOne({
      _id: id,
    });

    if (foundDecisionPoint) {
      throw createError(403, "DecisionPoint already exist");
    }
  }
}
