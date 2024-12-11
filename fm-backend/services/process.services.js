import createError from "http-errors";
import { omit } from "lodash";
import mongoose from "mongoose";
import DocumentType from "../schemas/documentType.schema.js";
import ProcessTag from "../schemas/process-tag.schema.js";
import Process from "../schemas/process.schema.js";
import UserProcess from "../schemas/userProcess.js";
import {
  buildPopulateOptions,
  getValidArray,
  getValidObject,
  handleError,
  successHandler,
  toCaseInsensitive,
} from "../utils/index.js";
import { stepIncludeFullDataPipeline } from "../utils/step.js";
import { getUserDetailProjectPipeline } from "../utils/user.js";
import { GroupProcessService } from "./group-process.services.js";
import { StepService } from "./step.services.js";
import { UserService } from "./user.services.js";
import Notification from "../schemas/notification.schema.js";
import {
  NotificationTitleEnum,
  NotificationTypeEnum,
} from "../constants/enums/notification.enum.js";

const ObjectId = mongoose.Types.ObjectId;

export class ProcessService {
  stepService;
  groupProcessService;
  userService;

  constructor() {
    this.stepService = new StepService();
    this.groupProcessService = new GroupProcessService();
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

      const dataPromise = Process.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get Processes Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "get");
    }
  }

  async getProcessesByAggregate(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Process.aggregate(pipeline);

      successHandler(res, data, "Get Process Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "create");
    }
  }

  async create(req, res, next) {
    try {
      const currentUserProfile = req?.auth;
      let processData = req?.body;
      processData = await this.validateProcess(processData);

      if (!processData?.documentTypeId) {
        const defaultDocumentType = await DocumentType.findOne({
          name: "Process",
          organizationId: processData?.organizationId,
        });
        if (defaultDocumentType?.id) {
          processData.documentTypeId = defaultDocumentType.id;
        } else {
          const newDefaultDocumentType = await DocumentType.create({
            name: "Process",
            description: "Process",
            createdBy: currentUserProfile._id,
            organizationId: processData?.organizationId,
          });
          processData.documentTypeId = newDefaultDocumentType.id;
        }
      }
      const newProcess = await Process.create({
        ...processData,
        createdBy: currentUserProfile._id,
      });

      successHandler(res, newProcess, "Create Process Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { processId } = req.params;
      let filter = req?.query?.filter || {};
      if (typeof filter === "string") {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      //*TODO: UPdate later
      const currentProcess = await Process.findOne({
        _id: processId,
        ...filter.where,
      }).populate("steps");

      successHandler(res, currentProcess, "Get Process Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { processId } = req.params;
      let processData = req?.body;

      const currentProcess = await Process.findOne({
        _id: processId,
      });

      if (!currentProcess) {
        throw createError(404, "Process not found");
      }

      if (processData?.name && processData?.name !== currentProcess.name) {
        await this.validateExistProcess(processData?.name);
      }

      const updatedProcess = await Process.findOneAndUpdate(
        {
          _id: processId,
        },
        processData
      );

      const listRelatedUser =
        await this.userService.getListUserRelatedWithProcess(processId);

      Promise.all(
        getValidArray(listRelatedUser).map((user) => {
          return Notification.create({
            processId: processId,
            organizationId: organizationId,
            type: NotificationTypeEnum.UPDATED_PROCESS_NOTIFICATION,
            title: NotificationTitleEnum.UPDATED_PROCESS_NOTIFICATION,
            userId: user,
            createdBy: _id,
          });
        })
      );

      successHandler(res, updatedProcess, "Update Process Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { _id, organizationId } = req?.auth;
      const { processId } = req.params;
      const process = await Process.findOne({
        _id: stepId,
      });

      await Process.deleteOne({
        _id: processId,
      });

      const listRelatedUser =
        await this.userService.getListUserRelatedWithProcess(processId);

      Promise.all(
        getValidArray(listRelatedUser).map((user) => {
          return Notification.create({
            processId: processId,
            organizationId: organizationId,
            type: NotificationTypeEnum.DELETED_PROCESS_NOTIFICATION,
            title: NotificationTitleEnum.DELETED_PROCESS_NOTIFICATION,
            userId: user,
            createdBy: _id,
            deletedName: process?.name || ''
          });
        })
      );

      successHandler(res, {}, "Delete Process Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "deleteById");
    }
  }

  async upsertProcessTags(req, res, next) {
    try {
      const { processId } = req.params;
      const tagIds = req?.body?.tagIds;

      await Promise.all(
        getValidArray(tagIds).map((tagId) => {
          return ProcessTag.create({ processId, tagId });
        })
      );

      successHandler(res, {}, "Upsert Process Tags Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/process.services.js",
        "upsertProcessTags"
      );
    }
  }

  async validateProcess(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    if (!data?.name) {
      throw createError(400, "Process name is required");
    }

    // await this.validateExistProcess(data?.name);

    return data;
  }

  async validateExistProcess(name) {
    const foundProcess = await Process.findOne({
      name: toCaseInsensitive(name),
    });

    if (foundProcess) {
      throw createError(403, "Process name already exist");
    }
  }

  async getDetailById(req, res, next) {
    try {
      const { processId } = req.params;

      const currentProcess = await Process.aggregate(
        this.getProcessDetailPipeline([processId])
      );

      successHandler(res, currentProcess?.[0], "Get Process Successfully");
    } catch (error) {
      handleError(next, error, "services/process.services.js", "getDetailById");
    }
  }

  async shareProcessToUsers(req, res, next) {
    try {
      const { processId } = req.params;
      const userIds = req?.body;

      if (Array.isArray(userIds)) {
        await UserProcess.deleteMany({ processId });

        const userProcess = getValidArray(userIds).map((userId) => ({
          processId,
          userId,
        }));
        await UserProcess.create(userProcess);
      }

      successHandler(res, {}, "Share process to user Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/process.services.js",
        "shareProcessToUsers"
      );
    }
  }

  async duplicateProcess(req, res, next) {
    try {
      const { _id } = req?.auth;
      const { processId } = req.params;
      const payload = req?.body;
      const { documentTypeId, copySharing, copyTags, copyNote, name } = payload;

      let newName = name;
      const process = await Process.findById(processId)
        .populate([
          "steps",
          "userProcesses",
          {
            path: "groups",
            populate: {
              path: "group",
            },
          },
          {
            path: "tags",
            populate: {
              path: "tag",
            },
          },
        ])
        .exec();

      if (!process) {
        throw createError(404, "Process not found");
      }

      // Remove the version from the name if it exists
      const nameWithoutVersion = name?.replace(/\s\(\d+\)$/, "").trim() || name;

      // Prepare regular expressions for matching any string before or after the name, with or without versions
      const anyPrefixOrSuffixRegex = new RegExp(`.*${nameWithoutVersion}.*`);
      const anyPrefixOrSuffixWithVersionRegex = new RegExp(
        `.*${nameWithoutVersion} \\(\\d+\\).*`
      );

      const duplicateSearchConditions = {
        $or: [
          { name: name }, // Exact match
          { name: { $regex: `^${name}`, $options: "i" } }, // Any text before the name
          { name: { $regex: `${name}+$`, $options: "i" } }, // Any text after the name
          { name: { $regex: `^${process?.name}`, $options: "i" } }, // Any text before the process name
          { name: { $regex: `${process?.name}+$`, $options: "i" } }, // Any text after the process name
          { name: { $regex: anyPrefixOrSuffixRegex, $options: "i" } }, // Match any prefix/suffix around the name
          {
            name: { $regex: anyPrefixOrSuffixWithVersionRegex, $options: "i" },
          }, // Match any prefix/suffix with version number
          { name: nameWithoutVersion }, // Exact match without version
          { name: { $regex: `^${nameWithoutVersion}`, $options: "i" } }, // Catch trailing text after the base name
          { name: { $regex: `${nameWithoutVersion}+$`, $options: "i" } }, // Catch text before the base name
        ],
      };

      const foundDuplicateProcesses = await Process.find(
        {
          ...duplicateSearchConditions,
          organizationId: process.organizationId,
        },
        { name: 1 }
      );

      if (foundDuplicateProcesses?.length > 1) {
        const lastNumber = getValidArray(foundDuplicateProcesses).reduce(
          (currentNumber, currentProcess) => {
            const match = currentProcess?.name?.match(/\((\d+)\)/);
            if (match) {
              const number = parseInt(match?.[1] ?? "0", 10);
              if (number === currentNumber) {
                return number + 1;
              }

              return Math.max(number, currentNumber);
            }
            return currentNumber;
          },
          foundDuplicateProcesses.length
        );

        if (payload?.name) {
          newName = `${payload.name.replace(/\s\(\d+\)/, "")} (${
            lastNumber + 1
          })`;
        }
      }

      const newProcess = await Process.create(
        omit(
          new Process({
            ...process,
            name: newName,
            description: process.description,
            createdBy: _id,
            userId: process?.userId ?? process?.createdBy ?? _id,
            editorNote: undefined,
            releaseNote: undefined,
            publishedDate: undefined,
            publishedById: undefined,
            isPublished: true,
            version: "1.0.0",
            archivedAt: null,
            documentTypeId: new ObjectId(documentTypeId),
            organizationId: process.organizationId,
          })?.toObject(),
          ["steps", "tags", "userProcesses", "groups", "id", "_id"]
        )
      );

      const newProcessId = newProcess?.id;
      if (!newProcessId) {
        throw createError(400, "Failed to duplicate process");
      }

      for (const step of getValidArray(process.steps)) {
        await this.stepService.replicateNewStepFromStepId(
          newProcessId,
          step?.id,
          copyNote
        );
      }
      if (copyTags) {
        await this.upsertTags(
          newProcessId,
          getValidArray(process?.tags)
            ?.map((tag) => tag?.tagId ?? "")
            .filter((tagId) => tagId)
        );
      }

      if (copySharing) {
        const { groups, userProcesses } = process;
        if (userProcesses?.length > 0) {
          const userProcess = getValidArray(userProcesses).map(
            (userProcess) => ({
              ...omit(getValidObject(userProcess), [
                "_id",
                "id",
                "createdAt",
                "updatedAt",
                "processId",
              ]),
              processId: newProcessId,
              isDirectlyShared: true,
            })
          );
          await UserProcess.create(userProcess);
        }
        if (groups?.length > 0) {
          await this.groupProcessService.shareProcessToGroupsHandler(
            {
              processId: newProcessId,
              groupIds: getValidArray(groups).map((group) => group?.groupId),
            },
            false
          );
        }
      }

      successHandler(res, newProcess, "Duplicate process Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/process.services.js",
        "duplicateProcess"
      );
    }
  }

  async upsertTags(processId, tagIds) {
    await ProcessTag.deleteMany({ processId });
    const newTags = getValidArray(tagIds).map((tagId) => ({
      processId,
      tagId,
    }));
    await Promise.all(
      getValidArray(newTags).map((newTag) => ProcessTag.create(newTag))
    );
  }

  async archiveProcess(req, res, next) {
    try {
      const { processId } = req.params;

      await Process.updateOne({ _id: processId }, { archivedAt: new Date() });

      successHandler(res, {}, "Archive process successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/process.services.js",
        "archiveProcess"
      );
    }
  }

  async restoreProcess(req, res, next) {
    try {
      const { processId } = req.params;

      await Process.updateOne({ _id: processId }, { archivedAt: null });

      successHandler(res, {}, "Restore process Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/process.services.js",
        "restoreProcess"
      );
    }
  }

  getProcessDetailPipeline(processIds, skip, limit) {
    const pipeline = [
      {
        $match: {
          _id: {
            $in: getValidArray(processIds).map(
              (processId) => new ObjectId(processId)
            ),
          },
        },
      },
      {
        $lookup: {
          from: "steps",
          let: {
            processId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$processId", "$$processId"],
                    },
                  ],
                },
              },
            },
            ...stepIncludeFullDataPipeline,
          ],
          as: "steps",
        },
      },
      {
        $lookup: {
          from: "groupprocesses",
          localField: "_id",
          foreignField: "processId",
          pipeline: [
            {
              $addFields: {
                id: "$_id",
              },
            },
          ],
          as: "groups",
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "groups.groupId",
          foreignField: "_id",
          pipeline: [
            {
              $addFields: {
                id: "$_id",
              },
            },
          ],
          as: "groups",
        },
      },
      {
        $lookup: {
          from: "collectionsprocesses",
          localField: "_id",
          foreignField: "processId",
          as: "collections",
        },
      },
      {
        $lookup: {
          from: "collections",
          localField: "collections.collectionId",
          foreignField: "_id",
          as: "collections",
        },
      },
      {
        $lookup: {
          from: "documenttypes",
          let: {
            documentTypeId: "$documentTypeId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$documentTypeId"],
                    },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "Icon",
                localField: "iconId",
                foreignField: "_id",
                as: "iconBuilder",
              },
            },
            {
              $unwind: {
                path: "$iconBuilder",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "documentType",
        },
      },
      {
        $unwind: {
          path: "$documentType",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "processtags",
          localField: "_id",
          foreignField: "processId",
          as: "processTag",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "processTag.tagId",
          foreignField: "_id",
          as: "tags",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "userprocesses",
          localField: "_id",
          foreignField: "processId",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                pipeline: [
                  {
                    ...getUserDetailProjectPipeline,
                  },
                ],
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                id: "$_id",
              },
            },
          ],
          as: "userProcesses",
        },
      },
      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          creatorName: {
            $concat: ["$creator.firstName", " ", "$creator.lastName"],
          },
          creatorImage: "$creator.image",
        },
      },
      {
        $addFields: {
          creatorName: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$creatorName", null] },
                  { $eq: ["$creatorName", ""] },
                  { $eq: ["$creatorName", undefined] },
                  { $eq: [{ $type: "$creatorName" }, "missing"] },
                ],
              },
              then: {
                $concat: ["$user.firstName", " ", "$user.lastName"],
              },
              else: "$creatorName",
            },
          },
          creatorImage: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$creatorImage", null] },
                  { $eq: ["$creatorImage", ""] },
                  { $eq: ["$creatorImage", undefined] },
                  { $eq: [{ $type: "$creatorImage" }, "missing"] },
                ],
              },
              then: "$user.image",
              else: "$creatorImage",
            },
          },
        },
      },
      {
        $project: {
          _id: false,
          id: "$_id",
          name: true,
          description: true,
          owner: true,
          startDate: true,
          endDate: true,
          userId: true,
          image: true,
          procedureIcon: true,
          procedureType: true,
          procedureIconColor: true,
          totalTime: true,
          organizationId: true,
          releaseNote: true,
          editorNote: true,
          public: true,
          status: true,
          reason: true,
          primaryGroupId: true,
          processWorkflowId: true,
          processWorkflowStepId: true,
          documentTypeId: true,
          tags: true,
          checkedOut: true,
          checkedOutById: true,
          checkedOutDate: true,
          dateSubmitted: true,
          reviewerId: true,
          reviewStarted: true,
          reviewComplete: true,
          previousStatus: true,
          publishedDate: true,
          rejectedDate: true,
          rejectedById: true,
          publishedById: true,
          updatedAt: true,
          createdAt: true,
          steps: true,
          collections: true,
          version: true,
          isPublished: true,
          groups: true,
          documentType: true,
          creatorName: true,
          creatorImage: true,
          createdBy: true,
          userProcesses: true,
        },
      },
      {
        $facet: {
          paginatedResults: [
            ...(skip ? [{ $skip: skip }] : []),
            ...(limit ? [{ $limit: limit }] : []),
          ],
          totalResults: [
            {
              $count: "count",
            },
          ],
        },
      },
    ];

    return pipeline;
  }
}
