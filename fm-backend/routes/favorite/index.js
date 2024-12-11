import express from "express";
import favoriteController from "../../controllers/favorite.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, favoriteController.get);
router.route("/").post(authController.authenticate, favoriteController.create);
router
  .route("/aggregate")
  .post(authController.authenticate, favoriteController.getByAggregation);

router.get(
  "/:favoriteId",
  authController.authenticate,
  favoriteController.findById
);

router.patch(
  "/:favoriteId",
  authController.authenticate,
  favoriteController.updateById
);

router.delete(
  "/:favoriteId",
  authController.authenticate,
  favoriteController.deleteById
);

router.put("/toggle", authController.authenticate, favoriteController.toggleFavorite);

export { router as favoriteRoute };
