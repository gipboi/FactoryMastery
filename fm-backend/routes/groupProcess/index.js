import express from "express";
import groupProcessController from "../../controllers/groupProcess.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, groupProcessController.get);
router
  .route("/")
  .post(authController.authenticate, groupProcessController.create);
router
  .route("/aggregate")
  .post(authController.authenticate, groupProcessController.getByAggregation);

router.get(
  "/:groupProcessId",
  authController.authenticate,
  groupProcessController.findById
);

router.patch(
  "/:groupProcessId",
  authController.authenticate,
  groupProcessController.updateById
);

router.delete(
  "/:groupProcessId",
  authController.authenticate,
  groupProcessController.deleteById
);

router.post(
  "/share-to-groups",
  authController.authenticate,
  groupProcessController.shareProcessToGroups
);

router.post(
  "/share-to-groups/batch",
  authController.authenticate,
  groupProcessController.shareProcessesToGroups
);

export { router as groupProcessRoute };
