import express from "express";
import organizationController from "../../controllers/organization.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/", organizationController.find);
router.post("/", authController.authenticate, organizationController.create);
router.patch(
  "/:organizationId",
  authController.authenticate,
  organizationController.updateById
);
router.delete(
  "/:organizationId",
  authController.authenticate,
  organizationController.deleteById
);

export { router as organizationRoute };
