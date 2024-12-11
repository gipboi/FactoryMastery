import express from "express";
import groupMemberController from "../../controllers/group-member.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/")
  .get(authController.authenticate, groupMemberController.get);

router
  .route("/aggregate")
  .post(authController.authenticate, groupMemberController.getGroupMembersByAggregate);

router.route("/").post(
  authController.authenticate,
  groupMemberController.create
);

router.patch(
  "/:groupMemberId",
  authController.authenticate,
  groupMemberController.updateById
);

router.delete(
  "/:groupMemberId",
  authController.authenticate,
  groupMemberController.deleteById
);

router
  .route("/batch-update")
  .post(authController.authenticate, groupMemberController.addGroupMembers);

export { router as groupMemberRoute };
