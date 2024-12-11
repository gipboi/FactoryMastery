import express from "express";
import decisionPointController from "../../controllers/decisionPoint.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, decisionPointController.get);
router.route("/").post(authController.authenticate, decisionPointController.create);
router.route("/aggregate").post(authController.authenticate, decisionPointController.getByAggregation);

router.get("/:decisionPointId", authController.authenticate, decisionPointController.findById);
router.patch("/:decisionPointId", authController.authenticate, decisionPointController.updateById);
router.delete("/:decisionPointId", authController.authenticate, decisionPointController.deleteById);

router.route("/create-many").post(authController.authenticate, decisionPointController.createMany);
router.route("/drop").put(authController.authenticate, decisionPointController.drop);


export { router as decisionPointRoute };
