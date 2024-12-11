import express from "express";
import authController from "../../controllers/auth.controller.js";
import userController from "../../controllers/user.controller.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/organizations", authController.signUpOrganization);
router.route("/me").get(authController.authenticate, userController.getUser);

export { router as authRoute };
