import { makeAutoObservable } from 'mobx';
import { RootStore } from 'stores';
import {
	ICompanyDetail,
	ICompanyReport,
	ICompanyReportPayload,
	ICompanyReportTable,
	IDashboardReport,
	IReportAction,
	IReportActionPayload,
	IReportActionTable,
	IReportCollectionPayload,
	IReportCollectionResponse,
	IReportDetail,
	IReportDetailPayload,
	IReportGeneralPayload,
	IReportGeneralResponse,
	IReportGroup,
	IReportGroupPayload,
	IReportGroupTable,
	IReportProcessPayload,
	IReportProcessResponse,
} from 'constants/report';
import { EPeriod } from 'constants/report/period';
import { IReportProcessTable } from 'interfaces/process';
import { PaginationList } from 'interfaces';
import {
	getCompanyReport,
	getCompanyReportDetail,
	getCompanyReportTable,
	getUserReport,
	getProcessReport,
	getCollectionReport,
	getActivityReport,
	exportReport,
	getDashboardReport,
} from 'API/report';

class ReportStore {
	rootStore: RootStore;

	generalInformation: IReportGeneralResponse | null = null;
	reportProcess: IReportProcessResponse | null = null;
	reportProcessTable?: PaginationList<IReportProcessTable>;
	reportGroups: IReportGroup | null = null;
	reportGroupsTable?: PaginationList<IReportGroupTable>;
	reportCollection: IReportCollectionResponse | null = null;
	// reportCollectionTable?: PaginationList<IReportCollectionTable>
	reportCollectionTable?: PaginationList<any>;
	reportAction: IReportAction | null = null;
	reportActionTable?: PaginationList<IReportActionTable>;

	reportPeriod: EPeriod = EPeriod.THIS_WEEK;
	reportDetail: IReportDetail | null = null;

	companyReport: ICompanyReport | null = null;
	companyReportTable?: PaginationList<ICompanyReportTable>;
	companyReportDetail?: ICompanyDetail;
	dashboardReport?: IDashboardReport;
	processReport?: any;
	userReport?: any;
	collectionReport?: any;
	activityReport?: any;

	constructor(rootStore: RootStore) {
		makeAutoObservable(this);

		this.rootStore = rootStore;
	}

	public setReportPeriod(value: EPeriod): void {
		this.reportPeriod = value;
	}

	public async getReportGeneralInformation(
		organizationId: string,
		payload: IReportGeneralPayload
	): Promise<void> {
		// const reportGeneralInformation = await getReportGeneral(organizationId, payload)
		// this.generalInformation = reportGeneralInformation
	}

	public async getReportProcess(
		organizationId: string,
		payload: IReportProcessPayload
	): Promise<void> {
		// const reportProcess = await getReportProcess(organizationId, payload)
		// this.reportProcess = reportProcess
	}

	public async getReportProcessTable(
		organizationId: string,
		payload: IReportProcessPayload
	): Promise<void> {
		// const reportProcessTable = await getReportProcessTable(organizationId, payload)
		// this.reportProcessTable = reportProcessTable
	}

	public async fetchReportGroups(
		organizationId: string,
		payload: IReportGroupPayload
	) {
		// this.reportGroups = await getReportGroups(organizationId, payload)
		// return this.reportGroups
	}

	public async fetchReportGroupTable(
		organizationId: string,
		payload: IReportGroupPayload
	) {
		// this.reportGroupsTable = await getReportGroupsTable(organizationId, payload)
		// return this.reportGroupsTable
	}

	public async getReportCollection(
		organizationId: string,
		payload: IReportCollectionPayload
	): Promise<void> {
		// const reportCollection = await getReportCollection(organizationId, payload)
		// this.reportCollection = reportCollection
	}

	public async getReportCollectionTable(
		organizationId: string,
		payload: IReportCollectionPayload
	): Promise<void> {
		// const reportCollectionTable = await getReportCollectionTable(organizationId, payload)
		// this.reportCollectionTable = reportCollectionTable
	}

	public async fetchReportAction(
		organizationId: string,
		payload: IReportActionPayload
	): Promise<void> {
		// const reportAction = await getReportAction(organizationId, payload)
		// this.reportAction = reportAction
	}

	public async fetchReportActionTable(
		organizationId: string,
		payload: IReportActionPayload
	): Promise<void> {
		// const reportActionTable = await getReportActionTable(organizationId, payload)
		// this.reportActionTable = reportActionTable
	}

	public async fetchSummaryReport(
		organizationId: string,
		startDate: Date,
		endDate: Date
	): Promise<void> {
		await Promise.all([
			this.getReportGeneralInformation(organizationId, { startDate, endDate }),
			this.getReportProcess(organizationId, { startDate, endDate }),
			this.getReportCollection(organizationId, { startDate, endDate }),
			this.fetchReportGroups(organizationId, { startDate, endDate }),
			this.fetchReportAction(organizationId, { startDate, endDate }),
		]);
	}

	public async fetchReportProcessDetail(
		organizationId: string,
		processId: string,
		payload: IReportDetailPayload
	) {
		// const response = await getReportProcessDetail(organizationId, processId, payload)
		// this.reportDetail = response
	}

	public async fetchReportCollectionDetail(
		organizationId: string,
		id: string,
		payload: IReportDetailPayload
	) {
		// const response = await getReportCollectionDetail(organizationId, id, payload)
		// this.reportDetail = response
	}

	public async fetchReportGroupDetail(
		organizationId: string,
		groupId: string,
		payload: IReportDetailPayload
	) {
		// const response = await getReportGroupDetail(organizationId, groupId, payload)
		// this.reportDetail = response
	}

	public async fetchCompanyReport(
		payload: ICompanyReportPayload
	): Promise<void> {
		const response = await getCompanyReport(payload);
		this.companyReport = response;
	}

	public async fetchCompanyReportTable(
		payload: ICompanyReportPayload
	): Promise<void> {
		const response = await getCompanyReportTable(payload);
		this.companyReportTable = response;
	}

	public async fetchCompanyReportDetail(
		id: string,
		payload: IReportGeneralPayload
	): Promise<void> {
		const response = await getCompanyReportDetail(id, payload);
		this.companyReportDetail = response;
	}

	public async getOrganizationReportDetail(
		payload: IReportDetailPayload
	): Promise<void> {
		try {
			await this.fetchDashboardReport(payload);
		} catch (error) {
			console.error('Error when fetching organization reports detail', error);
		}
	}

	public async fetchDashboardReport(
		params: IReportDetailPayload
	): Promise<void> {
		const response = await getDashboardReport(params);
		this.dashboardReport = response;
	}
}

export default ReportStore;
