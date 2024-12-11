import express from "express";
import authController from "../../controllers/auth.controller.js";
import cmsController from "../../controllers/cms.controller.js";

const router = express.Router();

router
  .route("/upload-file")
  .post(authController.authenticate, cmsController.uploadFile);
router
  .route("/upload-multi-file")
  .post(authController.authenticate, cmsController.uploadMultiFiles);

export { router as cmsRoute };
