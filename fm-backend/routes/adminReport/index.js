import express from "express";
import adminReportController from "../../controllers/adminReport.controller.js";
import authController from "../../controllers/auth.controller.js";

const router = express.Router();

router.route("/organization").post(authController.authenticate, authController.isSuperAdmin, adminReportController.getCompanyReport);
router.route("/organization/table").post(authController.authenticate, authController.isSuperAdmin, adminReportController.getCompanyReportTable);
router.route("/organizations/:organizationId").patch(authController.authenticate, authController.isSuperAdmin, adminReportController.updateAdminOrganizationById);
router.route("/organizations/detail/:organizationId").post(authController.authenticate, authController.isSuperAdmin, adminReportController.getCompanyReportDetail);

router.get('/dashboard', authController.authenticate, authController.isOrgAdmin, adminReportController.getDashboardReport);

export { router as adminReportRoute };
