import createError from "http-errors";
import Media from "../schemas/media.schema.js";
import {
  buildPopulateOptions,
  getValidArray,
  handleError,
  successHandler,
} from "../utils/index.js";

export class MediaService {
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

      const dataPromise = Media.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get Medias Successfully");
    } catch (error) {
      handleError(next, error, "services/media.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Media.aggregate(pipeline);

      successHandler(res, data, "Get Medias Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/media.services.js",
        "getByAggregation"
      );
    }
  }

  async create(req, res, next) {
    try {
      let mediaData = req?.body;
      const currentUserId = req?.auth?._id;
      mediaData = await this.validateMedia(mediaData);

      const createdMedia = await Media.create({
        ...mediaData,
        createdBy: currentUserId,
      });

      successHandler(res, createdMedia, "Create Media Successfully");
    } catch (error) {
      handleError(next, error, "services/media.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { mediaId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentMedia = await Media.findOne({
        _id: mediaId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentMedia, "Get Media Successfully");
    } catch (error) {
      handleError(next, error, "services/media.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { mediaId } = req.params;
      let mediaData = req?.body;

      const currentMedia = await Media.findOne({
        _id: mediaId,
      });

      if (!currentMedia) {
        throw createError(404, "Media not found");
      }

      const updatedMedia = await Media.findOneAndUpdate(
        {
          _id: mediaId,
        },
        mediaData
      );

      successHandler(res, updatedMedia, "Update Media Successfully");
    } catch (error) {
      handleError(next, error, "services/media.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { mediaId } = req.params;
      await Media.deleteOne({
        _id: mediaId,
      });

      successHandler(res, {}, "Delete Media Successfully");
    } catch (error) {
      handleError(next, error, "services/media.services.js", "deleteById");
    }
  }

  async dropMediaType(req, res, next) {
    try {
      const { mediaType, stepId } = req.body;

      await Media.deleteMany({
        mediaType,
        stepId,
      });

      successHandler(res, {}, "Drop Media Type Successfully");
    } catch (error) {
      handleError(next, error, "services/media.services.js", "dropMediaType");
    }
  }

  async createManyMedias(req, res, next) {
    try {
      const medias = req.body;

      await Promise.all(
        getValidArray(medias).map((media) => Media.create(media))
      );

      successHandler(res, {}, "Create many Medias Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/media.services.js",
        "createManyMedias"
      );
    }
  }

  async validateMedia(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistMedia(id) {
    const foundMedia = await Media.findOne({
      _id: id,
    });

    if (foundMedia) {
      throw createError(403, "Media already exist");
    }
  }
}
