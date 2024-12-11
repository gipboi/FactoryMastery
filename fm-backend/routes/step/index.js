import express from "express";
import stepController from "../../controllers/step.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, stepController.get);
router.route("/").post(authController.authenticate, stepController.create);
router
  .route("/aggregate")
  .post(authController.authenticate, stepController.getByAggregation);

router.get("/:stepId", authController.authenticate, stepController.findById);

router.patch(
  "/:stepId",
  authController.authenticate,
  stepController.updateById
);

router.delete(
  "/:stepId",
  authController.authenticate,
  stepController.deleteById
);

router.patch(
  "/position/batch",
  authController.authenticate,
  stepController.updateStepPositionBatch
);

export { router as stepRoute };
