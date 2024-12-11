import express from "express";
import decisionPointStepController from "../../controllers/decisionPointStep.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, decisionPointStepController.get);
router.route("/").post(authController.authenticate, decisionPointStepController.create);

router.get("/:decisionPointStepId", authController.authenticate, decisionPointStepController.findById);
router.patch("/:decisionPointStepId", authController.authenticate, decisionPointStepController.updateById);
router.delete("/:decisionPointStepId", authController.authenticate, decisionPointStepController.deleteById);

router.route("/create-many").post(authController.authenticate, decisionPointStepController.createMany);
router.route("/drop").put(authController.authenticate, decisionPointStepController.drop);

export { router as decisionPointStepRoute };
