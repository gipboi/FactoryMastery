import { AdminReportService } from '../services/admin-report.services.js';

async function getCompanyReport(req, res, next) {
	const adminReportService = new AdminReportService();
	await adminReportService.getCompanyReport(req, res, next);
	next();
}

async function getCompanyReportTable(req, res, next) {
	const adminReportService = new AdminReportService();
	await adminReportService.getCompanyReportTable(req, res, next);
	next();
}

async function updateAdminOrganizationById(req, res, next) {
	const adminReportService = new AdminReportService();
	await adminReportService.updateAdminOrganizationById(req, res, next);
	next();
}

async function getCompanyReportDetail(req, res, next) {
	const adminReportService = new AdminReportService();
	await adminReportService.getCompanyReportDetail(req, res, next);
	next();
}

async function getDashboardReport(req, res, next) {
	const adminReportService = new AdminReportService();
	await adminReportService.getDashboardReport(req, res, next);
	next();
}

export default {
	getCompanyReport,
	getCompanyReportTable,
	updateAdminOrganizationById,
	getCompanyReportDetail,
	getDashboardReport,
};
