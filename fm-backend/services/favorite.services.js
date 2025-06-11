import createError from "http-errors";
import Favorite from "../schemas/favorite.schema.js";
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from "../utils/index.js";

export class FavoriteService {
  constructor() {}

  async get(req, res, next) {
    try {
      const { _id } = req.auth;
      let filter = req?.query?.filter || {};
      if (typeof filter === "string") {
        filter = JSON.parse(filter);
      }

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const dataPromise = Favorite.find({
        ...filter.where,
        userId: _id,
      });

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get Favorites Successfully");
    } catch (error) {
      handleError(next, error, "services/favorite.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await Favorite.aggregate(pipeline);

      successHandler(res, data, "Get Favorites Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/favorite.services.js",
        "getByAggregation"
      );
    }
  }

  async create(req, res, next) {
    try {
      let favoriteData = req?.body;
      const currentUserId = req?.auth?._id;
      favoriteData = await this.validateFavorite(favoriteData);

      const createdFavorite = await Favorite.create({
        ...favoriteData,
        createdBy: currentUserId,
      });

      successHandler(res, createdFavorite, "Create Favorite Successfully");
    } catch (error) {
      handleError(next, error, "services/favorite.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { favoriteId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentFavorite = await Favorite.findOne({
        _id: favoriteId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentFavorite, "Get Favorite Successfully");
    } catch (error) {
      handleError(next, error, "services/favorite.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { favoriteId } = req.params;
      let favoriteData = req?.body;

      const currentFavorite = await Favorite.findOne({
        _id: favoriteId,
      });

      if (!currentFavorite) {
        throw createError(404, "Favorite not found");
      }

      const updatedFavorite = await Favorite.findOneAndUpdate(
        {
          _id: favoriteId,
        },
        favoriteData,
        { new: true }
      );

      successHandler(res, updatedFavorite, "Update Favorite Successfully");
    } catch (error) {
      handleError(next, error, "services/favorite.services.js", "updateById");
    }
  }

  async deleteById(req, res, next) {
    try {
      const { favoriteId } = req.params;
      await Favorite.deleteOne({
        _id: favoriteId,
      });

      successHandler(res, {}, "Delete Favorite Successfully");
    } catch (error) {
      handleError(next, error, "services/favorite.services.js", "deleteById");
    }
  }

  async toggleFavorite(req, res, next) {
    try {
      const { _id } = req.auth;
      const data = req.body;
      const existingFavorite = await Favorite.findOne({
        ...data,
        userId: _id,
      });
      if (existingFavorite) {
        await Favorite.deleteOne({
          _id: existingFavorite._id,
        });
      } else {
        await Favorite.create({
          ...data,
          userId: _id,
        });
      }

      successHandler(res, {}, "Toggle Favorite Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/favorite.services.js",
        "toggleFavorite"
      );
    }
  }

  async validateFavorite(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistFavorite(id) {
    const foundFavorite = await Favorite.findOne({
      _id: id,
    });

    if (foundFavorite) {
      throw createError(403, "Favorite already exist");
    }
  }
}
