import { AxiosResponse } from 'axios';
import { api } from 'API';
import {
	ICompanyReport,
	ICompanyReportPayload,
	ICompanyReportTable,
	IReportAction,
	IReportActionPayload,
	IReportActionTable,
	IReportCollectionPayload,
	IReportCollectionResponse,
	IReportDetailPayload,
	IReportDetail,
	IReportGeneralPayload,
	IReportGeneralResponse,
	IReportGroup,
	IReportGroupPayload,
	IReportGroupTable,
	IReportProcessPayload,
	IReportProcessResponse,
	ICompanyDetail,
	IDashboardReport,
} from 'constants/report';
import { IReportProcessTable } from 'interfaces/process';
import { IOrganization } from 'interfaces/organization';
import { createAdditionalCrudService } from 'API/additionalCrud';
import { PaginationList } from 'interfaces';

const REPORT_URL = '/reports';
const ADMIN_REPORT_URL = '/admin-reports';
const reportAdditionalCrudService = createAdditionalCrudService<
	ICompanyReport,
	ICompanyReport
>('reports');
const adminReportAdditionalCrudService = createAdditionalCrudService<
	ICompanyReport,
	ICompanyReport
>('admin-reports');

export async function getReportGeneral(
	organizationId: number,
	payload: IReportGeneralPayload
): Promise<IReportGeneralResponse> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/general`,
		payload
	);
	return response.data;
}

export async function getReportProcess(
	organizationId: number,
	payload: IReportProcessPayload
): Promise<IReportProcessResponse> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/process`,
		payload
	);
	return response.data;
}

export async function getReportProcessTable(
	organizationId: number,
	payload: IReportProcessPayload
): Promise<PaginationList<IReportProcessTable>> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/process/table`,
		payload
	);
	return response.data;
}

export async function getReportGroups(
	organizationId: number,
	payload: IReportGroupPayload
): Promise<IReportGroup> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/group`,
		payload
	);
	return response.data;
}

export async function getReportGroupsTable(
	organizationId: number,
	payload: IReportGroupPayload
): Promise<PaginationList<IReportGroupTable>> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/group/table`,
		payload
	);
	return response.data;
}

export async function getReportCollection(
	organizationId: number,
	payload: IReportCollectionPayload
): Promise<IReportCollectionResponse> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/collection`,
		payload
	);
	return response.data;
}

export async function getReportAction(
	organizationId: number,
	payload: IReportActionPayload
): Promise<IReportAction> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/action`,
		payload
	);
	return response.data;
}

export async function getReportActionTable(
	organizationId: number,
	payload: IReportActionPayload
): Promise<PaginationList<IReportActionTable>> {
	const response: AxiosResponse = await api.post(
		`${REPORT_URL}/${organizationId}/action/table`,
		payload
	);
	return response.data;
}

export async function getCompanyReport(
	payload: ICompanyReportPayload
): Promise<ICompanyReport> {
	return adminReportAdditionalCrudService.post(
		'organization',
		payload
	) as Promise<ICompanyReport>;
}

export async function getCompanyReportTable(
	payload: ICompanyReportPayload
): Promise<PaginationList<ICompanyReportTable>> {
	return adminReportAdditionalCrudService.post(
		'organization/table',
		payload
	) as Promise<PaginationList<ICompanyReportTable>>;
}

export async function getCompanyReportDetail(
	id: string,
	payload: IReportGeneralPayload
): Promise<ICompanyDetail> {
	const response = await api.post(
		`${ADMIN_REPORT_URL}/organizations/detail/${id}`,
		payload,
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: sessionStorage?.getItem('adminPassword'),
			},
		}
	);
	return response.data?.data;
}

export async function updateAdminOrganizationById(
	organizationId: string,
	data: Partial<IOrganization>
): Promise<void> {
	await api.patch(`${ADMIN_REPORT_URL}/organizations/${organizationId}`, data, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: sessionStorage?.getItem('adminPassword'),
		},
	});
}

export async function getDashboardReport(
	params: IReportDetailPayload
): Promise<IDashboardReport> {
	const response = await api.get(`${ADMIN_REPORT_URL}/dashboard`, {
		params,
	});
	return response.data?.data;
}
