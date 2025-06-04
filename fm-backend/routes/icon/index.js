import express from "express";
import iconController from "../../controllers/icon.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

// router.route("/").get(authController.authenticate, iconController.get);
router.route("/").post(authController.authenticate, iconController.create);
router
  .route("/aggregate")
  .post(authController.authenticate, iconController.getByAggregation);

router.get("/:iconId", authController.authenticate, iconController.findById);

router.patch(
  "/:iconId",
  authController.authenticate,
  iconController.updateById
);

router.delete(
  "/:iconId",
  authController.authenticate,
  iconController.deleteById
);

router.patch(
  "/position/batch",
  authController.authenticate,
  iconController.updateIconPositionBatch
);

router.delete(
  "/assign-default/:iconId",
  authController.authenticate,
  iconController.assignDefault
);
export { router as iconRoute };
