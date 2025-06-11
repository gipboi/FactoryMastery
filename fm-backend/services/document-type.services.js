import createError from "http-errors";
import DocumentType from "../schemas/documentType.schema.js";
import {
  buildPopulateOptions,
  handleError,
  successHandler,
} from "../utils/index.js";

export class DocumentTypeService {
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

      const dataPromise = DocumentType.find(filter?.where);

      if (filter?.offset) {
        dataPromise.skip(filter?.offset);
      }
      if (filter?.limit) {
        dataPromise.limit(filter?.limit);
      }

      const data = await dataPromise.populate(populateOptions);

      successHandler(res, data, "Get DocumentTypes Successfully");
    } catch (error) {
      handleError(next, error, "services/documentType.services.js", "get");
    }
  }

  async getByAggregation(req, res, next) {
    try {
      const pipeline = req?.body?.pipeline || [];

      const data = await DocumentType.aggregate(pipeline);

      successHandler(res, data, "Get DocumentTypes Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/documentType.services.js",
        "getByAggregation"
      );
    }
  }

  async create(req, res, next) {
    try {
      let documentTypeData = req?.body;
      const currentUserId = req?.auth?._id;
      documentTypeData = await this.validateDocumentType(documentTypeData);

      const createdDocumentType = await DocumentType.create({
        ...documentTypeData,
        createdBy: currentUserId,
      });

      successHandler(
        res,
        createdDocumentType,
        "Create DocumentType Successfully"
      );
    } catch (error) {
      handleError(next, error, "services/documentType.services.js", "create");
    }
  }

  async findById(req, res, next) {
    try {
      const { documentTypeId } = req.params;
      const filter = JSON.parse(req.query.filter || "{}");

      let populateOptions = [];

      if (filter?.include) {
        populateOptions = buildPopulateOptions(filter?.include);
      }

      const currentDocumentType = await DocumentType.findOne({
        _id: documentTypeId,
        ...filter.where,
      }).populate(populateOptions);

      successHandler(res, currentDocumentType, "Get DocumentType Successfully");
    } catch (error) {
      handleError(next, error, "services/documentType.services.js", "findById");
    }
  }

  async updateById(req, res, next) {
    try {
      const { documentTypeId } = req.params;
      let documentTypeData = req?.body;

      const currentDocumentType = await DocumentType.findOne({
        _id: documentTypeId,
      });

      if (!currentDocumentType) {
        throw createError(404, "DocumentType not found");
      }

      const updatedDocumentType = await DocumentType.findOneAndUpdate(
        {
          _id: documentTypeId,
        },
        documentTypeData,
        { new: true }
      );

      successHandler(
        res,
        updatedDocumentType,
        "Update DocumentType Successfully"
      );
    } catch (error) {
      handleError(
        next,
        error,
        "services/documentType.services.js",
        "updateById"
      );
    }
  }

  async deleteById(req, res, next) {
    try {
      const { documentTypeId } = req.params;
      await DocumentType.deleteOne({
        _id: documentTypeId,
      });

      successHandler(res, {}, "Delete DocumentType Successfully");
    } catch (error) {
      handleError(
        next,
        error,
        "services/documentType.services.js",
        "deleteById"
      );
    }
  }

  async validateDocumentType(data) {
    if (!data?.organizationId) {
      throw createError(400, "Organization Id is required");
    }

    return data;
  }

  async validateExistDocumentType(id) {
    const foundDocumentType = await DocumentType.findOne({
      _id: id,
    });

    if (foundDocumentType) {
      throw createError(403, "DocumentType already exist");
    }
  }
}
