import { CmsService } from "../services/cms.services.js";

async function uploadFile(req, res, next) {
  const cmsService = new CmsService();
  await cmsService.uploadFile(req, res, next);
  next();
}

async function uploadMultiFiles(req, res, next) {
  const cmsService = new CmsService();
  await cmsService.uploadMultiFiles(req, res, next);
  next();
}

export default {
  uploadFile,
  uploadMultiFiles,
};
