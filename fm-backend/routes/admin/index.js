import express from "express";
import authController from "../../controllers/auth.controller.js";
import userController from "../../controllers/user.controller.js";

const router = express.Router();

router
  .route("/change-password")
  .post(
    authController.authenticate,
    authController.isOrgAdmin,
    userController.changePassword
  );

export { router as adminRoute };
