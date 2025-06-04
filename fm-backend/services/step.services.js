import createError from "http-errors";
import { difference, omit, uniq } from "lodash";
import mongoose from "mongoose";
import { StepPosition } from "../constants/enums/step.enum.js";
import Block from "../schemas/block.schema.js";
import BlockMedia from "../schemas/blockMedia.schema.js";
import DecisionPoint from "../schemas/decisionPoint.schema.js";
import DecisionPointMedia from "../schemas/decisionPointMedia.schema.js";
import DecisionPointStep from "../schemas/decisionPointStep.schema.js";
import Media from "../schemas/media.schema.js";
import Step from "../schemas/step.schema.js";
import {
  buildPopulateOptions,
  getValidArray,
  getValidObject,
  handleError,
  successHandler,
} from "../utils/index.js";
import { stepIncludeFullDataPipeline } from "../utils/step.js";
import { UserService } from "./user.services.js";
import Notification from "../schemas/notification.schema.js";
import {
  NotificationTitleEnum,
  NotificationTypeEnum,
} from "../constants/enums/notification.enum.js";
const ObjectId = mongoose.Types.ObjectId;

export class StepService {
  userService;

  constructor() {
    this.userService = new UserService();
  }

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

      const dataPromise = Step.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get Steps Successfully");
    } catch (error) {
      handleError(next, error, "services/step.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Step.aggregate(pipeline);

      successHandler(res, data, "Get Steps Successfully");
    } catch (error) {
      handleError(next, error, "services/step.services.js", "getByAggregation");
    }
  }

  async create(req, res, next) {
    try {
      let stepData = req?.body;
      const currentUserId = req?.auth?._id;
      stepData = await this.validateStep(stepData);

      const { addOption } = stepData;

      if (addOption === StepPosition.AppendToTheEndOfList) {
        const latestStep = await Step.findOne({
          processId: stepData.processId,
        }).sort({ position: -1 });

        stepData.position = latestStep?.position + 1 || 1;
      } else if (addOption === StepPosition.PrependToTheBeginningOfList) {
        await Step.updateMany(
          {
            processId: stepData.processId,
          },
          {
            $inc: { position: 1 },
          }
        );

        stepData.position = 1;
      }

      const createdStep = await Step.create({
        ...stepData,
        createdBy: currentUserId,
      });

      successHandler(res, createdStep, "Create Step Successfully");
    } catch (error) {
      handleError(next, error, "services/step.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { stepId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentStep = await Step.findOne({
        _id: stepId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentStep, "Get Step Successfully");
    } catch (error) {
      handleError(next, error, "services/step.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { stepId } = req.params;
      let stepData = req?.body;

      const currentStep = await Step.findOne({
        _id: stepId,
      });

      if (!currentStep) {
        throw createError(404, "Step not found");
      }

      const updatedStep = await Step.findOneAndUpdate(
        {
          _id: stepId,
        },
        stepData
      );

      if (updatedStep.processId) {
        const listRelatedUser =
          await this.userService.getListUserRelatedWithProcess(
            updatedStep.processId
          );

        Promise.all(
          getValidArray(listRelatedUser).map((user) => {
            return Notification.create({
              processId: updatedStep.processId,
              stepId,
              organizationId: organizationId,
              type: NotificationTypeEnum.UPDATED_STEP_NOTIFICATION,
              title: NotificationTitleEnum.UPDATED_STEP_NOTIFICATION,
              userId: user,
              createdBy: _id,
            });
          })
        );
      }

      successHandler(res, updatedStep, "Update Step Successfully");
    } catch (error) {
      handleError(next, error, "services/step.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { stepId } = req.params;

      const step = await Step.findOne({
        _id: stepId,
      });
      await Step.deleteOne({
        _id: stepId,
      });

      if (step.processId) {
        const listRelatedUser =
          await this.userService.getListUserRelatedWithProcess(step.processId);

        Promise.all(
          getValidArray(listRelatedUser).map((user) => {
            return Notification.create({
              processId: step.processId,
              stepId,
              organizationId: organizationId,
              type: NotificationTypeEnum.DELETED_STEP_NOTIFICATION,
              title: NotificationTitleEnum.DELETED_STEP_NOTIFICATION,
              userId: user,
              createdBy: _id,
              deletedName: step?.name || ''
            });
          })
        );
      }

      successHandler(res, {}, "Delete Step Successfully");
    } catch (error) {
      handleError(next, error, "services/step.services.js", "deleteById");
    }
  }

  async updateStepPositionBatch(req, res, next) {
    try {
      const steps = req?.body || [];

      if (getValidArray(steps).length) {
        await Promise.all(
          steps.map((step) =>
            Step.updateOne(
              {
                _id: step.id,
              },
              {
                position: step.position,
              }
            )
          )
        );
      }

      successHandler(res, {}, "Batch update steps position Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/step.services.js",
        "updateStepPositionBatch"
      );
    }
  }

  async replicateNewStepFromStepId(processId, stepIdToReplicateFrom, copyNote) {
    try {
      if (!stepIdToReplicateFrom) {
        throw createError(400, "Step id to replicate from is required");
      }

      const stepToReplicateFrom = await Step.aggregate([
        {
          $match: {
            _id: new ObjectId(stepIdToReplicateFrom),
          },
        },
        ...stepIncludeFullDataPipeline,
      ]).then((data) => data?.[0]);

      if (!stepToReplicateFrom) throw createError(404, "Base step not found");
      const mediaIdsLinkedToDecisionPoint = [];

      const newStep = await Step.create({
        ...omit(stepToReplicateFrom, [
          "originalStepId",
          "media",
          "blocks",
          "icon",
          "id",
          "_id",
          "processId",
          "__v",
          "createdAt",
          "updatedAt",
          "ecnSuggestions",
        ]),
        processId,
      });

      if (!newStep?.id) {
        throw createError(500, "Failed to create new step");
      }
      const newStepId = newStep?.id;

      //*INFO: Replicate blocks
      for (const block of getValidArray(stepToReplicateFrom?.blocks)) {
        let newMedia;
        if (block?.media?.length) {
          mediaIdsLinkedToDecisionPoint.push(String(block?.mediaId));
          newMedia = await this.upsertMediaToStep(newStepId, block?.media?.[0]);
        }
        const newBlock = await Block.create({
          ...omit(block, [
            "stepId",
            "decisionPoints",
            "icon",
            "media",
            "id",
            "_id",
            "blockMedias",
          ]),
          mediaId: block?.media ? newMedia?.id : undefined,
          stepId: newStep?.id,
        });

        for (const blockMedia of getValidArray(block?.blockMedias)) {
          if (blockMedia?.media?.length) {
            mediaIdsLinkedToDecisionPoint.push(String(blockMedia?.mediaId));
            const newMedia = await this.upsertMediaToStep(
              newStepId,
              blockMedia?.media?.[0]
            );
            newMedia?.id &&
              (await BlockMedia.create({
                mediaId: newMedia?.id,
                blockId: newBlock?.id,
              }));
          }
        }

        if (newBlock?.id) {
          const newMediaIds = await this.replicateDecisionPoints(
            block?.decisionPoints,
            newBlock?.id,
            newStep?.id
          );
          mediaIdsLinkedToDecisionPoint.push(...newMediaIds);
        }
      }
      const allMedias = [...getValidArray(stepToReplicateFrom?.media)];
      const allMediaIds = getValidArray(allMedias).map((media) =>
        String(media?._id ?? media?.id)
      );
      const mediaIdsNotLinkedToDecisionPoint = uniq(
        difference(allMediaIds, mediaIdsLinkedToDecisionPoint)
      );
      const mediasNotLinkedToDecisionPoint = uniq(
        allMedias.filter((media) =>
          mediaIdsNotLinkedToDecisionPoint.includes(
            String(media?._id ?? media?.id)
          )
        )
      );

      Media.create(
        getValidArray(mediasNotLinkedToDecisionPoint).map((media) => ({
          ...omit(media, ["stepId", "id", "_id"]),
          stepId: newStep?.id,
        }))
      );
    } catch (error) {
      console.log(
        "🚀 ~ file: step.service.ts ~ line 373 ~ StepService ~ replicateNewStepFromStepId ~ error",
        error
      );
      throw error;
    }
  }

  async upsertMediaToStep(stepId, media) {
    const foundMedia = await Media.findOne({
      stepId,
      ...omit(getValidObject(media), [
        "id",
        "_id",
        "stepId",
        "createdAt",
        "updatedAt",
      ]),
    });
    if (foundMedia) {
      return foundMedia;
    }

    return Media.create({
      ...omit(getValidObject(media), [
        "id",
        "_id",
        "stepId",
        "createdAt",
        "updatedAt",
      ]),
      stepId,
    });
  }

  replicateDecisionPoints = async (decisionPoints, blockId, newStepId) => {
    const mediaIds = [];
    for (const decisionPoint of getValidArray(decisionPoints)) {
      const newDecisionPoint = await DecisionPoint.create({
        ...omit(getValidObject(decisionPoint), [
          "decisionPointMedias",
          "decisionPointSteps",
          "id",
          "_id",
        ]),
        blockId,
      });
      if (newDecisionPoint?.id) {
        const mediaIdsLinkedToDecisionPoint =
          await this.replicateDecisionPointMedias(
            decisionPoint?.decisionPointMedias,
            newDecisionPoint?.id,
            newStepId
          );
        await this.replicateDecisionPointSteps(
          decisionPoint?.decisionPointSteps,
          newDecisionPoint?.id
        );
        mediaIds.push(...mediaIdsLinkedToDecisionPoint);
      }
    }
    return mediaIds;
  };

  replicateDecisionPointSteps = async (decisionPointSteps, decisionPointId) => {
    await DecisionPointStep.create(
      getValidArray(decisionPointSteps).map((decisionPointStep) => ({
        ...omit(decisionPointStep, ["id", "_id", "step"]),
        decisionPointId,
      }))
    );
  };

  replicateDecisionPointMedias = async (
    decisionPointMedias,
    decisionPointId,
    newStepId
  ) => {
    const mediaIdsLinkedToDecisionPoint = [];
    for (const decisionPointMedia of getValidArray(decisionPointMedias)) {
      if (decisionPointMedia?.media?.length) {
        mediaIdsLinkedToDecisionPoint.push(String(decisionPointMedia?.mediaId));
        const newMedia = await this.upsertMediaToStep(
          newStepId,
          decisionPointMedia?.media?.[0]
        );
        if (newMedia?.id) {
          await DecisionPointMedia.create({
            mediaId: newMedia?.id,
            decisionPointId,
          });
        }
      }
    }
    return mediaIdsLinkedToDecisionPoint;
  };

  async validateStep(data) {
    if (!data?.processId) {
      throw createError(400, "Process Id is required");
    }

    return data;
  }

  async validateExistStep(id) {
    const foundStep = await Step.findOne({
      _id: id,
    });

    if (foundStep) {
      throw createError(403, "Step already exist");
    }
  }
}
