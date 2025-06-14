import express from "express";
import authController from "../../controllers/auth.controller.js";
import supportMessageThreadController from "../../controllers/supportMessageThread.controller.js";

const router = express.Router();

router
  .route("/")
  .get(authController.authenticate, supportMessageThreadController.get);

  router.route("/").post(
  authController.authenticate,
  supportMessageThreadController.create
);

router.route("/aggregate").post(
  authController.authenticate,
  // authController.isAdmin,
  supportMessageThreadController.getByAggregation
);

router.get(
  "/:supportMessageThreadId",
  authController.authenticate,
  // authController.isAdmin,
  supportMessageThreadController.findById
);

router.patch(
  "/:supportMessageThreadId",
  authController.authenticate,
  // authController.isAdmin,
  supportMessageThreadController.updateById
);

router.delete(
  "/:supportMessageThreadId",
  authController.authenticate,
  authController.isAdmin,
  supportMessageThreadController.deleteById
);

router.get(
  "/:supportMessageThreadId/support-messages",
  authController.authenticate,
  supportMessageThreadController.getSupportMessages
);

router.post(
  "/:supportMessageThreadId/support-messages",
  authController.authenticate,
  supportMessageThreadController.createSupportMessages
);

router.patch(
  "/:supportMessageThreadId/support-message-thread-user-seen",
  authController.authenticate,
  supportMessageThreadController.markSupportMessageThreadAsSeen
);

router.get(
  "/:supportMessageThreadId/status-history",
  authController.authenticate,
  supportMessageThreadController.getStatusHistory
);

export { router as supportMessageThreadRoute };
