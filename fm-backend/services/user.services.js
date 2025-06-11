import mongoose from "mongoose";
import createError from "http-errors";
import GroupMember from "../schemas/groupMember.schema.js";
import Organization from "../schemas/organization.schema.js";
import User from "../schemas/user.schema.js";
import UserProcess from "../schemas/userProcess.js";
import {
  buildPopulateOptions,
  generateRandomPassword,
  getValidArray,
  handleError,
  hashPassword,
  successHandler,
  toCaseInsensitive,
  validatePassword,
} from "../utils/index.js";
import {
  getInvitationTemplate,
  getResetPasswordByAdminTemplate,
} from "../utils/mail.js";
import { MailService } from "./mail.service.js";
import { getUserDetailProjectPipeline } from "../utils/user.js";
import Process from "../schemas/process.schema.js";

const ObjectId = mongoose.Types.ObjectId;

export class UserService {
  constructor() {}

  async getUser(req, res, next) {
    try {
      const currentUser = await User.findOne({
        _id: req?.auth?._id,
        disabled: false,
      })
        .populate("organization")
        .exec();

      successHandler(res, currentUser, "Get User Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "getUser");
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      let filter = JSON.parse(req.query.filter || "{}");

      const [groupMembers, userProcess, currentUser] = await Promise.all([
        GroupMember.find({ userId }).populate("group"),
        UserProcess.findOne({
          userId: userId,
        }).populate("process"),
        User.findOne({
          id: userId,
          ...filter?.where,
        })
          .populate("organization")
          .exec(),
      ]);

      successHandler(
        res,
        {
          ...currentUser,
          groupMembers,
          groups: groupMembers.map((groupMember) => groupMember?.group),
          userProcess,
          userCollection: [],
        },
        "Get User By Id Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/user.services.js", "getUserById");
      next(error);
    }
  }

  async findUser(req, res, next) {
    try {
      let filter = req?.query?.filter || {};
      if (typeof filter === "string") {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentUser = await User.find({
        ...filter?.where,
      }).populate(populateOptions);
      successHandler(res, currentUser, "Find Users Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "findUser");
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      let userData = req?.body;

      if (userData?.password) {
        const { password, ...rest } = userData;
        rest.encryptedPassword = password;
        userData = rest;
      }

      userData = await this.validateUser(userData);

      //*INFO: Hash password
      userData.encryptedPassword = await hashPassword(
        userData.encryptedPassword
      );

      const createdUser = await User.create(userData);
      const organization = await Organization.findOne({
        _id: createdUser?.organizationId,
      });
      //*INFO: Assign user to groups
      if (userData?.groups?.length) {
        await Promise.all(
          getValidArray(userData?.groups).map((group) => {
            if (group?.groupId) {
              return GroupMember.create({
                userId: createdUser._id,
                groupId: group?.groupId,
                permission: group?.permission,
              });
            }
            return null;
          })
        );
      }

      const mailService = new MailService();
      mailService.sendEmail({
        to: createdUser?.email,
        subject: "Invitation",
        htmlString: getInvitationTemplate({
          name: createdUser?.fullName,
          password: userData?.password ?? '',
          orgName: organization?.name,
          subdomain: organization?.subdomain,
          authRole: createdUser?.authRole
        }),
      });

      successHandler(res, createdUser, "Create User Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { userId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentUser = await User.findOne({
        _id: userId,
        ...(filter?.where || {}),
      }).populate(populateOptions);

      successHandler(res, currentUser, "Get User Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "findById");
      next(error);
    }
  }

  async updateById(req, res, next) {
    try {
      const { userId } = req.params;
      let userData = req?.body;

      const currentUser = await User.findOne({
        _id: userId,
      });

      if (!currentUser) {
        throw createError(404, "User not found");
      }

      if (userData?.email && userData?.email !== currentUser.email) {
        await this.validateExistUser(userData?.email);
      }

      if (userData?.newPassword) {
        userData.encryptedPassword = await hashPassword(userData?.newPassword);
        delete userData.newPassword;
      }

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
        },
        userData,
        { new: true }
      );

      successHandler(res, updatedUser, "Update User Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { userId } = req.params;
      await User.deleteOne({
        _id: userId,
      });

      successHandler(res, {}, "Delete User Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "deleteById");
    }
  }

  async getUsersByAggregate(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await User.aggregate(pipeline);

      successHandler(res, data?.[0], "Get Users Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/user.services.js",
        "getUsersByAggregate"
      );
    }
  }

  async countUsers(req, res, next) {
    try {
      const query = req?.query || {};

      const count = await User.countDocuments(query?.where || {});

      successHandler(res, count, "Count Users Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "countUsers");
    }
  }

  async changePassword(req, res, next) {
    try {
      const data = req?.body;
      const encryptedPassword = await hashPassword(data?.newPassword);

      const user = await User.findOneAndUpdate(
        {
          _id: data?.userId,
        },
        {
          encryptedPassword,
        },
        { new: true }
      ).populate("organization");

      const mailService = new MailService();
      mailService.sendEmail({
        to: user?.email,
        subject: "Change Password",
        htmlString: getResetPasswordByAdminTemplate({
          name:
            user?.fullName ?? (user?.firstName + " " + user?.lastName)?.trim(),
          password: data?.newPassword,
          subdomain: user?.organization?.subdomain,
        }),
      });

      successHandler(res, {}, "Change password Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "changePassword");
    }
  }

  async validatePassword(req, res, next) {
    try {
      const { userId } = req?.params;
      const { password } = req?.body;

      const user = await User.findOne({
        _id: userId,
      });

      if (!user) {
        throw createError(404, "User not found");
      }

      const isValidPassword = await validatePassword(
        password,
        user?.encryptedPassword
      );

      if (!isValidPassword) {
        throw createError(400, "Invalid password!");
      }

      successHandler(res, {}, "Validate password Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "validatePassword");
    }
  }

  async shareProcesses(req, res, next) {
    try {
      const { userId } = req?.params;
      const { processIds } = req?.body;

      const userProcesses = getValidArray(processIds).map((processId) => ({
        processId,
        userId,
      }));

      const createdUserProcesses = await UserProcess.create(userProcesses);
      successHandler(res, createdUserProcesses, "Share processes Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "shareProcesses");
    }
  }

  async unshareProcesses(req, res, next) {
    try {
      const { userId } = req?.params;
      const { processId } = req?.body;

      await UserProcess.deleteMany({ userId, processId });

      successHandler(res, {}, "Unshare processes Successfully");
    } catch (error) {
      handleError(next, error, "services/user.services.js", "unshareProcesses");
    }
  }

  async getListUserRelatedWithProcess(processId) {
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(processId),
        },
      },
      {
        $lookup: {
          from: "groupprocesses",
          localField: "_id",
          foreignField: "processId",
          pipeline: [
            {
              $lookup: {
                from: "groupmembers",
                localField: "groupId",
                foreignField: "groupId",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "userId",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $match: {
                            isInactive: { $ne: true },
                            disabled: { $ne: true },
                          },
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
                    $match: {
                      user: { $ne: null },
                    },
                  },
                ],
                as: "groupMembers",
              },
            },
            {
              $addFields: {
                memberIds: {
                  $map: {
                    input: "$groupMembers",
                    as: "member",
                    in: "$$member.userId",
                  },
                },
              },
            },
            {
              $project: {
                id: "$groupId",
                _id: "$groupId",
                memberIds: 1,
              },
            },
          ],
          as: "groups",
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
        $lookup: {
          from: "userprocesses",
          localField: "_id",
          foreignField: "processId",
          as: "userProcesses",
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
          status: true,
          reason: true,
          primaryGroupId: true,
          processWorkflowId: true,
          processWorkflowStepId: true,
          documentTypeId: true,
          dateSubmitted: true,
          publishedDate: true,
          rejectedDate: true,
          rejectedById: true,
          publishedById: true,
          updatedAt: true,
          createdAt: true,
          version: true,
          isPublished: true,
          creator: true,
          createdBy: true,
          userProcesses: true,
          groups: true,
        },
      },
    ];

    const processDetail = (await Process.aggregate(pipeline))?.[0];

    const listUserRelated = [
      ...new Set([
        ...processDetail?.userProcesses?.map((userProcess) =>
          String(userProcess.userId)
        ),
        ...processDetail?.groups
          ?.map((group) => group?.memberIds?.map(String))
          ?.flat(),
        String(processDetail?.createdBy),
      ]),
    ];

    return listUserRelated;
  }

  async validateUser(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    if (!data?.email) {
      throw createError(400, "Email is required");
    }

    if (!data?.encryptedPassword) {
      data.encryptedPassword = generateRandomPassword();
    }

    await this.validateExistUser(data?.email);

    return data;
  }

  async validateExistUser(email) {
    const foundUser = await User.findOne({
      email: toCaseInsensitive(email),
    });

    if (foundUser) {
      throw createError(403, "Email already exist");
    }
  }
}
