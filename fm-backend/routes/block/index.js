import express from "express";
import authController from "../../controllers/auth.controller.js";
import blockController from "../../controllers/block.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, blockController.get);
router.route("/").post(authController.authenticate, blockController.create);
router.route("/aggregate").post(authController.authenticate, blockController.getByAggregation);

router.get("/:blockId", authController.authenticate, blockController.findById);
router.patch("/:blockId", authController.authenticate, blockController.updateById);
router.delete("/:blockId", authController.authenticate, blockController.deleteById);

router.patch("/:blockId/upsert-media", authController.authenticate, blockController.upsertMedia);

export { router as blockRoute };
