import express from "express";
import groupMessageThreadUserController from "../../controllers/groupMessageThreadUser.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/batch")
  .post(
    authController.authenticate,
    groupMessageThreadUserController.createBatch
  );


export { router as groupMessageThreadUserRoute };
