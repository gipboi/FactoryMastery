import express from "express";
import processController from "../../controllers/process.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, processController.get);

router
  .route("/aggregate")
  .post(authController.authenticate, processController.getProcessesByAggregate);

router.post(
  "/aggregate/count",
  authController.authenticate,
  processController.aggregateCountProcesses
);

router.route("/").post(authController.authenticate, processController.create);

router.get(
  "/:processId",
  authController.authenticate,
  processController.findById
);

router.patch(
  "/:processId",
  authController.authenticate,
  processController.updateById
);

router.delete(
  "/:processId",
  authController.authenticate,
  processController.deleteById
);

router.get(
  "/:processId/detail",
  authController.authenticate,
  processController.getDetailById
);

router.post(
  "/:processId/tags",
  authController.authenticate,
  processController.upsertProcessTags
);

router.patch(
  "/:processId/share-to-users",
  authController.authenticate,
  processController.shareProcessToUsers
);

router.post(
  "/:processId/duplicate",
  authController.authenticate,
  processController.duplicateProcess
);

router.patch(
  "/:processId/archive",
  authController.authenticate,
  processController.archiveProcess
);

router.patch(
  "/:processId/restore",
  authController.authenticate,
  processController.restoreProcess
);

export { router as processRoute };
