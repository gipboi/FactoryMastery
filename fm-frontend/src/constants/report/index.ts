import { IOrganization } from 'interfaces/organization'

export interface IReportGeneralPayload {
  startDate: Date
  endDate: Date
}

export interface IReportStatistic {
  total: number
  percentChange: number
}

export interface IReportGeneralResponse {
  process: IReportStatistic
  collection: IReportStatistic
  group: IReportStatistic
  user: IReportStatistic
}

export interface IReportProcessPayload extends IReportGeneralPayload {
  skip?: number
  limit?: number
  name?: string
  creatorIds?: number[]
  documentTypeIds?: number[]
  tagIds?: number[]
  isExport?: boolean
}

export interface IReportProcessResponse {
  totalView: IReportStatistic
  totalCreator: IReportStatistic
}

export interface IReportGroupPayload extends IReportGeneralPayload {
  skip?: number
  limit?: number
  name?: string
  userIds?: number[]
  collectionIds?: number[]
}

export interface IReportGroupTable {
  id: number
  name: string
  users: string
  collections: string
  views: number
  edits: number
}

export interface IReportGroup {
  totalUsers: IReportStatistic
  totalCollections: IReportStatistic
}

export interface IReportCollectionPayload extends IReportGeneralPayload {
  skip?: number
  limit?: number
  name?: string
  processIds?: number[]
  documentTypeIds?: number[]
  isExport?: boolean
}

export interface IReportCollectionResponse {
  totalProcess: IReportStatistic
  totalView: IReportStatistic
  totalGroup: IReportStatistic
}

export interface IReportActionPayload {
  startDate: Date
  endDate: Date
  skip?: number
  limit?: number
  userIds?: number[]
  processIds?: number[]
  collectionIds?: number[]
}

export interface IReportActionTable {
  id: number
  action: string
  user: string
  process: string
  collection: string[]
  createdAt: Date
}

export interface IReportAction {
  totalViews: IReportStatistic
  totalEdits: IReportStatistic
  totalNotes: IReportStatistic
  totalComments: IReportStatistic
}

export interface ICompanyReportPayload extends IReportGeneralPayload {
  licenses: string[]
  skip?: number
  limit?: number
  name?: string
}

export interface ICompanyReport {
  totalCompany: IReportStatistic
  totalProcess: IReportStatistic
  totalCollection: IReportStatistic
  totalUser: IReportStatistic
}

export interface ICompanyReportTable {
  id: number
  name: string
  license: string
  lastSignInAt: Date
  user: number
  process: number
  collection: number
  views: number
  edits: number
}

export interface IReportDetailPayload extends IReportGeneralPayload {
  name?: string
  skip: number
  limit: number
}

export interface IReportDetail {
  name: string
  results: IReportActionTable[]
  totalCount: number
  totalView: IReportStatistic
  totalEdit: IReportStatistic
  totalNote: IReportStatistic
  totalComment: IReportStatistic
}

export interface ICompanyDetail extends IOrganization {
  totalUser: number
  totalProcess: number
  totalCollection: number
  totalLogin: number
  totalView: number
  totalEdit: number
}
