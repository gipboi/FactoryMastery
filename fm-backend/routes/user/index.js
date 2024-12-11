import express from "express";
import userController from "../../controllers/user.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, userController.findUser);
router.route("/").post(authController.authenticate, userController.create);
router
  .route("/count/total")
  .get(authController.authenticate, userController.countUsers);
router
  .route("/:userId")
  .get(authController.authenticate, userController.findById);
router
  .route("/:userId")
  .patch(authController.authenticate, userController.updateById);
router
  .route("/:userId")
  .delete(authController.authenticate, userController.deleteById);
router
  .route("/aggregate")
  .post(authController.authenticate, userController.getUsersByAggregate);
router
  .route("/:userId/validate-password")
  .post(authController.authenticate, userController.validatePassword);
router
  .route("/:userId/share-processes")
  .post(authController.authenticate, userController.shareProcesses);
router
  .route("/:userId/unshare-processes")
  .post(authController.authenticate, userController.unshareProcesses);

export { router as userRoute };
