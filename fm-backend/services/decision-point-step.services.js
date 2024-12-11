import createError from "http-errors";
import DecisionPointStep from "../schemas/decisionPointStep.schema.js";
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from "../utils/index.js";

export class DecisionPointStepService {
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

      const dataPromise = DecisionPointStep.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get DecisionPointSteps Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "get"
      );
    }
  }

  async create(req, res, next) {
    try {
      let decisionPointStepData = req?.body;
      const currentUserId = req?.auth?._id;
      decisionPointStepData = await this.validateDecisionPointStep(
        decisionPointStepData
      );

      const createdDecisionPointStep = await DecisionPointStep.create({
        ...decisionPointStepData,
        createdBy: currentUserId,
      });

      successHandler(
        res,
        createdDecisionPointStep,
        "Create DecisionPointStep Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "create"
      );
    }
  }

  async findById(req, res, next) {
    try {
      const { decisionPointStepId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentDecisionPointStep = await DecisionPointStep.findOne({
        _id: decisionPointStepId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(
        res,
        currentDecisionPointStep,
        "Get DecisionPointStep Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "findById"
      );
    }
  }

  async updateById(req, res, next) {
    try {
      const { decisionPointStepId } = req.params;
      let decisionPointStepData = req?.body;

      const currentDecisionPointStep = await DecisionPointStep.findOne({
        _id: decisionPointStepId,
      });

      if (!currentDecisionPointStep) {
        throw createError(404, "DecisionPointStep not found");
      }

      const updatedDecisionPointStep = await DecisionPointStep.findOneAndUpdate(
        {
          _id: decisionPointStepId,
        },
        decisionPointStepData
      );

      successHandler(
        res,
        updatedDecisionPointStep,
        "Update DecisionPointStep Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { decisionPointStepId } = req.params;
      await DecisionPointStep.deleteOne({
        _id: decisionPointStepId,
      });

      successHandler(res, {}, "Delete DecisionPointStep Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "deleteById"
      );
    }
  }

  async createMany(req, res, next) {
    try {
      const decisionPointSteps = req?.body;
      const currentUserId = req?.auth?._id;

      const createdDecisionPointStep = await DecisionPointStep.create(
        decisionPointSteps
      );

      successHandler(
        res,
        createdDecisionPointStep,
        "Create DecisionPointSteps Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "createMany"
      );
    }
  }

  async drop(req, res, next) {
    try {
      const { decisionPointId } = req.body;

      await DecisionPointStep.deleteMany({
        decisionPointId,
      });

      successHandler(res, {}, "Drop DecisionPointSteps Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/decision-point-step.services.js",
        "drop"
      );
    }
  }

  async validateDecisionPointStep(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistDecisionPointStep(id) {
    const foundDecisionPointStep = await DecisionPointStep.findOne({
      _id: id,
    });

    if (foundDecisionPointStep) {
      throw createError(403, "DecisionPointStep already exist");
    }
  }
}
