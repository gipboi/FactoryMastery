import express from "express";
import groupController from "../../controllers/group.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(authController.authenticate, groupController.get);

router
  .route("/aggregate")
  .post(authController.authenticate, groupController.getGroupsByAggregate);

router.post(
  "/aggregate/count",
  authController.authenticate,
  groupController.aggregateCountGroups
);

router
  .route("/")
  .post(
    authController.authenticate,
    authController.isAdmin,
    groupController.create
  );

router.get("/:groupId", authController.authenticate, groupController.findById);

router.get(
  "/:groupId/count-member",
  authController.authenticate,
  groupController.countMember
);

router.patch(
  "/:groupId",
  authController.authenticate,
  authController.isAdmin,
  groupController.updateById
);

router.delete(
  "/:groupId",
  authController.authenticate,
  authController.isAdmin,
  groupController.deleteById
);

router.post(
  "/:groupId/duplicate",
  authController.authenticate,
  authController.isAdmin,
  groupController.duplicateGroup
);

export { router as groupRoute };
