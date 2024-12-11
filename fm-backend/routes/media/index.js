import express from "express";
import authController from "../../controllers/auth.controller.js";
import mediaController from "../../controllers/media.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, mediaController.get);
router.route("/").post(authController.authenticate, mediaController.create);
router
  .route("/aggregate")
  .post(authController.authenticate, mediaController.getByAggregation);

router.get("/:mediaId", authController.authenticate, mediaController.findById);

router.patch(
  "/:mediaId",
  authController.authenticate,
  mediaController.updateById
);

router.delete(
  "/:mediaId",
  authController.authenticate,
  mediaController.deleteById
);

router.put(
  "/drop",
  authController.authenticate,
  mediaController.dropMediaType
);

router.post(
  "/create-many",
  authController.authenticate,
  mediaController.createManyMedias
);

export { router as mediaRoute };
