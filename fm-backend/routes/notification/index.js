import express from "express";
import notificationController from "../../controllers/notification.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, notificationController.get);

router
  .route("/")
  .post(authController.authenticate, notificationController.create);
router
  .route("/aggregate")
  .post(authController.authenticate, notificationController.getByAggregation);

router.get(
  "/:notificationId",
  authController.authenticate,
  notificationController.findById
);

router.patch(
  "/:notificationId",
  authController.authenticate,
  notificationController.updateById
);

router.delete(
  "/:notificationId",
  authController.authenticate,
  notificationController.deleteById
);

router.post(
  "/seen-all",
  authController.authenticate,
  notificationController.seenAll
);

export { router as notificationRoute };
