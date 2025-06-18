import { IOrganization } from 'interfaces/organization';

export interface IReportGeneralPayload {
	startDate: Date;
	endDate: Date;
}

export interface IReportStatistic {
	total: number;
	percentChange: number;
}

export interface IReportGeneralResponse {
	process: IReportStatistic;
	collection: IReportStatistic;
	group: IReportStatistic;
	user: IReportStatistic;
}

export interface IReportProcessPayload extends IReportGeneralPayload {
	skip?: number;
	limit?: number;
	name?: string;
	creatorIds?: number[];
	documentTypeIds?: number[];
	tagIds?: number[];
	isExport?: boolean;
}

export interface IReportProcessResponse {
	totalView: IReportStatistic;
	totalCreator: IReportStatistic;
}

export interface IReportGroupPayload extends IReportGeneralPayload {
	skip?: number;
	limit?: number;
	name?: string;
	userIds?: number[];
	collectionIds?: number[];
}

export interface IReportGroupTable {
	id: number;
	name: string;
	users: string;
	collections: string;
	views: number;
	edits: number;
}

export interface IReportGroup {
	totalUsers: IReportStatistic;
	totalCollections: IReportStatistic;
}

export interface IReportCollectionPayload extends IReportGeneralPayload {
	skip?: number;
	limit?: number;
	name?: string;
	processIds?: number[];
	documentTypeIds?: number[];
	isExport?: boolean;
}

export interface IReportCollectionResponse {
	totalProcess: IReportStatistic;
	totalView: IReportStatistic;
	totalGroup: IReportStatistic;
}

export interface IReportActionPayload {
	startDate: Date;
	endDate: Date;
	skip?: number;
	limit?: number;
	userIds?: number[];
	processIds?: number[];
	collectionIds?: number[];
}

export interface IReportActionTable {
	id: number;
	action: string;
	user: string;
	process: string;
	collection: string[];
	createdAt: Date;
}

export interface IReportAction {
	totalViews: IReportStatistic;
	totalEdits: IReportStatistic;
	totalNotes: IReportStatistic;
	totalComments: IReportStatistic;
}

export interface ICompanyReportPayload extends IReportGeneralPayload {
	licenses: string[];
	skip?: number;
	limit?: number;
	name?: string;
}

export interface ICompanyReport {
	totalCompany: IReportStatistic;
	totalProcess: IReportStatistic;
	totalCollection: IReportStatistic;
	totalUser: IReportStatistic;
}

export interface ICompanyReportTable {
	id: number;
	name: string;
	license: string;
	lastSignInAt: Date;
	user: number;
	process: number;
	collection: number;
	views: number;
	edits: number;
}

export interface IReportDetailPayload extends IReportGeneralPayload {
	name?: string;
	skip?: number;
	limit?: number;
	period?: string;
}

export interface IReportDetail {
	name: string;
	results: IReportActionTable[];
	totalCount: number;
	totalView: IReportStatistic;
	totalEdit: IReportStatistic;
	totalNote: IReportStatistic;
	totalComment: IReportStatistic;
}

export interface ICompanyDetail extends IOrganization {
	totalUser: number;
	totalProcess: number;
	totalCollection: number;
	totalLogin: number;
	totalView: number;
	totalEdit: number;
}

export interface IDashboardReport {
	stats: {
		overview: {
			groups: {
				value: string | number;
				change: string;
				changeType: string;
			};
			processes: {
				value: string | number;
				change: string;
				changeType: string;
			};
			collections: {
				value: string | number;
				change: string;
				changeType: string;
			};
			users: {
				value: string | number;
				change: string;
				changeType: string;
			};
			threads: {};
		};
		processes: {
			totalSteps: number;
			completedSteps: number;
			avgRating: number;
			pendingReview: number;
			favorites: number;
			highRated: number;
			mostFavoriteProcess: {
				id: string;
				name: string;
			};
		};
		collections: {
			favorites: number;
			mostFavoriteCollection: {
				id: string;
				name: string;
			};
		};
		users: {
			_id: string | null;
			totalUsers: number;
			activeUsers: number;
			viewers: number;
			editors: number;
			admins: number;
			newThisWeek: number;
			highActivity: number;
		};
		messages: {
			totalMessages: number;
			threads: number;
			unreadMessages: number;
			avgResponseTime: string;
		};
		content: {
			documentTypes: number;
			tags: number;
			favorites: number;
			iconBuilders: number;
		};
	};
	charts: {
		processRatingData: Array<{
			_id: string;
			name: string;
			rating: number;
			favorites: number;
			users: number;
		}>;
		userActivityData: Array<{
			_id: string;
			name: string;
			image: string;
			activity: number;
			role: string;
			processes: number;
			logins: number;
		}>;
		weeklyActivityData: Array<{
			day: string;
			users: number;
			processes: number;
			favorites: number;
		}>;
		processTypeData: Array<{
			name: string;
			value: number;
			color: string;
		}>;
		threadData: {
			stats: Array<{
				total: number;
				unclaimed: number;
				claimed: number;
				resolved: number;
				critical: number;
				high: number;
				medium: number;
				low: number;
			}>;
			statusDistribution: Array<{
				name: string;
				value: number;
				color: string;
			}>;
			priorityDistribution: Array<{
				name: string;
				value: number;
				color: string;
			}>;
		};
	};
	period: string;
	dateRange: {
		startDate: string;
		endDate: string;
	};
}
