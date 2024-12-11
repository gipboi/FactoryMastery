import express from "express";
import documentTypeController from "../../controllers/documentType.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, documentTypeController.get);
router.route("/").post(authController.authenticate, authController.isAdmin, documentTypeController.create);
router.route("/aggregate").post(authController.authenticate, authController.isAdmin, documentTypeController.getByAggregation);

router.get("/:documentTypeId", authController.authenticate, authController.isAdmin, documentTypeController.findById);
router.patch("/:documentTypeId", authController.authenticate, authController.isAdmin, documentTypeController.updateById);
router.delete("/:documentTypeId", authController.authenticate, authController.isAdmin, documentTypeController.deleteById);

export { router as documentTypeRoute };
