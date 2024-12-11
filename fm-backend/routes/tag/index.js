import express from "express";
import tagController from "../../controllers/tag.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/")
  .get(authController.authenticate, tagController.get);
router
  .route("/")
  .post(
    authController.authenticate,
    authController.isAdmin,
    tagController.create
  );
router
  .route("/aggregate")
  .post(
    authController.authenticate,
    authController.isAdmin,
    tagController.getByAggregation
  );

router.get(
  "/:tagId",
  authController.authenticate,
  authController.isAdmin,
  tagController.findById
);

router.patch(
  "/:tagId",
  authController.authenticate,
  authController.isAdmin,
  tagController.updateById
);

router.delete(
  "/:tagId",
  authController.authenticate,
  authController.isAdmin,
  tagController.deleteById
);

export { router as tagRoute };
