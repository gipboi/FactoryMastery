import createError from "http-errors";
import Tag from "../schemas/tag.schema.js";
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from "../utils/index.js";

export class TagService {
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

      const dataPromise = Tag.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get Tags Successfully");
    } catch (error) {
      handleError(next, error, "services/tag.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Tag.aggregate(pipeline);

      successHandler(res, data, "Get Tags Successfully");
    } catch (error) {
      handleError(next, error, "services/tag.services.js", "getByAggregation");
    }
  }

  async create(req, res, next) {
    try {
      let tagData = req?.body;
      const currentUserId = req?.auth?._id;
      tagData = await this.validateTag(tagData);

      const createdTag = await Tag.create({
        ...tagData,
        createdBy: currentUserId,
      });

      successHandler(res, createdTag, "Create Tag Successfully");
    } catch (error) {
      handleError(next, error, "services/tag.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { tagId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentTag = await Tag.findOne({
        _id: tagId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentTag, "Get Tag Successfully");
    } catch (error) {
      handleError(next, error, "services/tag.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { tagId } = req.params;
      let tagData = req?.body;

      const currentTag = await Tag.findOne({
        _id: tagId,
      });

      if (!currentTag) {
        throw createError(404, "Tag not found");
      }

      const updatedTag = await Tag.findOneAndUpdate(
        {
          _id: tagId,
        },
        tagData,
        { new: true }
      );

      successHandler(res, updatedTag, "Update Tag Successfully");
    } catch (error) {
      handleError(next, error, "services/tag.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { tagId } = req.params;
      await Tag.deleteOne({
        _id: tagId,
      });

      successHandler(res, {}, "Delete Tag Successfully");
    } catch (error) {
      handleError(next, error, "services/tag.services.js", "deleteById");
    }
  }

  async validateTag(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistTag(id) {
    const foundTag = await Tag.findOne({
      _id: id,
    });

    if (foundTag) {
      throw createError(403, "Tag already exist");
    }
  }
}
