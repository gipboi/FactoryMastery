import express from "express";
import decisionPointMediaController from "../../controllers/decisionPointMedia.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, decisionPointMediaController.get);
router.route("/").post(authController.authenticate, decisionPointMediaController.create);

router.get("/:decisionPointMediaId", authController.authenticate, decisionPointMediaController.findById);
router.patch("/:decisionPointMediaId", authController.authenticate, decisionPointMediaController.updateById);
router.delete("/:decisionPointMediaId", authController.authenticate, decisionPointMediaController.deleteById);

router.route("/create-many").post(authController.authenticate, decisionPointMediaController.createMany);
router.route("/drop").put(authController.authenticate, decisionPointMediaController.drop);

export { router as decisionPointMediaRoute };
