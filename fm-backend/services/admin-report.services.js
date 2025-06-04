import mongoose from 'mongoose';
import { getValidArray, handleError, successHandler } from '../utils/index.js';
import dayjs from 'dayjs';
import {
  getCompanyReportTablePipeline,
  getGeneralCompanyReportPipeline,
} from '../utils/report.pipeline.js';
import Organization from '../schemas/organization.schema.js';
import { EOrganizationLicense } from '../constants/enums/organization.enum.js';
import User from '../schemas/user.schema.js';
import Process from '../schemas/process.schema.js';
import AuditTrail from '../schemas/auditTrail.schema.js';

export class AdminReportService {
  constructor() {}

  async getCompanyReport(req, res, next) {
    try {
      const { startDate, endDate, licenses } = req?.body;
      const {
        startOfCurrentPeriod,
        endOfCurrentPeriod,
        startOfPreviousPeriod,
        endOfPreviousPeriod,
      } = this.getTimeRange(startDate, endDate);

      const currentSummaryPipeline = getGeneralCompanyReportPipeline(
        licenses,
        startOfCurrentPeriod.toDate(),
        endOfCurrentPeriod.toDate()
      );

      const previousSummaryPipeline = getGeneralCompanyReportPipeline(
        licenses,
        startOfPreviousPeriod.toDate(),
        endOfPreviousPeriod.toDate()
      );

      const [currentSummary, previousSummary] = await Promise.all([
        Organization.aggregate(currentSummaryPipeline),
        Organization.aggregate(previousSummaryPipeline),
      ]);

      const [
        currentTotalCompany,
        currentTotalProcess,
        currentTotalCollection,
        currentTotalUser,
      ] = [
        currentSummary[0]?.totalCompany,
        currentSummary[0]?.totalProcess,
        currentSummary[0]?.totalCollection,
        currentSummary[0]?.totalUser,
      ];

      const [
        previousTotalCompany,
        previousTotalProcess,
        previousTotalCollection,
        previousTotalUser,
      ] = [
        previousSummary[0]?.totalCompany,
        previousSummary[0]?.totalProcess,
        previousSummary[0]?.totalCollection,
        previousSummary[0]?.totalUser,
      ];

      const companyPercentChange = this.calculatePercentChange(
        currentTotalCompany,
        previousTotalCompany
      );
      const processPercentChange = this.calculatePercentChange(
        currentTotalProcess,
        previousTotalProcess
      );
      const collectionPercentChange = this.calculatePercentChange(
        currentTotalCollection,
        previousTotalCollection
      );
      const userPercentChange = this.calculatePercentChange(
        currentTotalUser,
        previousTotalUser
      );

      successHandler(
        res,
        {
          totalCompany: {
            total: currentTotalCompany,
            percentChange: companyPercentChange,
          },
          totalProcess: {
            total: currentTotalProcess,
            percentChange: processPercentChange,
          },
          totalCollection: {
            total: currentTotalCollection,
            percentChange: collectionPercentChange,
          },
          totalUser: {
            total: currentTotalUser,
            percentChange: userPercentChange,
          },
        },
        'Get admin report Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/admin-report.services.js',
        'getCompanyReport'
      );
    }
  }

  async getCompanyReportTable(req, res, next) {
    try {
      const payload = req?.body;
      const { startDate, endDate, licenses, name = '' } = payload;
      const startTime = dayjs(startDate);
      const endTime = dayjs(endDate);

      const companyTablePipeline = getCompanyReportTablePipeline(
        startTime.toDate(),
        endTime.toDate(),
        payload
      );

      const matchLicense =
        getValidArray(licenses).length === 0
          ? [{}]
          : [
              { license: { inq: getValidArray(licenses) } },
              { license: { eq: undefined } },
            ];
      const matchLicenses =
        getValidArray(licenses).length === 0 ||
        getValidArray(licenses).includes(EOrganizationLicense.FREE)
          ? { or: matchLicense }
          : { license: { inq: getValidArray(licenses) } };
      const [paginationList, countResponse] = await Promise.all([
        Organization.aggregate(companyTablePipeline),
        Organization.aggregate([
          {
            $match: {
              name: { $regex: name, $options: 'i' },
              ...matchLicenses,
            },
          },
          {
            $count: 'total',
          },
        ]).then((result) => result[0]?.total || 0),
      ]);

      successHandler(
        res,
        {
          results: getValidArray(paginationList),
          totalCount: countResponse.count,
        },
        'Get company table report Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/admin-report.services.js',
        'getCompanyReportTable'
      );
    }
  }

  async updateAdminOrganizationById(req, res, next) {
    try {
      const { organizationId } = req.params;
      let organizationData = req?.body;

      const currentOrganization = await Organization.findOne({
        _id: organizationId,
      });

      if (!currentOrganization) {
        throw createError(404, 'Organization not found');
      }

      if (
        organizationData?.name &&
        organizationData?.name !== currentOrganization.name
      ) {
        await this.validateExistOrganization(organizationData?.name);
      }

      const updatedOrganization = await Organization.findOneAndUpdate(
        {
          _id: organizationId,
        },
        organizationData
      );

      successHandler(
        res,
        {
          ...updatedOrganization,
          ...organizationData,
        },
        'Update Organization Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/admin-report.services.js',
        'updateAdminOrganizationById'
      );
    }
  }

  async getCompanyReportDetail(req, res, next) {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate } = req.body;

      const [
        currentOrganization,
        totalUser,
        totalProcess,
        totalCollection = 0,
        totalLogin = 0,
        totalView = 0,
        totalEdit = 0,
      ] = await Promise.all([
        Organization.findOne({
          _id: organizationId,
        }),
        User.countDocuments({
          ...this.getFilterByPeriod(startDate, endDate, organizationId),
        }),
        Process.countDocuments({
          ...this.getFilterByPeriod(startDate, endDate, organizationId),
          $or: [{ archivedAt: undefined }, { archivedAt: null }],
        }),
        // Collection.count({
        //   ...this.getFilterByPeriod(startDate, endDate, organizationId),
        // }),
        // AudiTrail.count({
        //   ...this.getFilterByPeriod(startDate, endDate, organizationId),
        //   action: EAuditAction.LOGIN,
        // }),
        // AudiTrail.count({
        //   ...this.getFilterByPeriod(startDate, endDate, organizationId),
        //   action: EAuditAction.VIEW,
        // }),
        // AudiTrail.count({
        //   ...this.getFilterByPeriod(startDate, endDate, organizationId),
        //   action: EAuditAction.UPDATE,
        // }),
      ]);

      if (!currentOrganization) {
        throw createError(404, 'Organization not found');
      }     

      successHandler(
        res,
        {
          ...JSON.parse(JSON.stringify(currentOrganization)),
          totalUser: totalUser,
          totalProcess: totalProcess,
          totalCollection: totalCollection,
          totalLogin: totalLogin,
          totalView: totalView,
          totalEdit: totalEdit,
        },
        'Get Organization Successfully'
      );
    } catch (error) {
      handleError(
        next,
        error,
        'services/admin-report.services.js',
        'getCompanyReportDetail'
      );
    }
  }

  getTimeRange(startDate, endDate) {
    const startOfCurrentPeriod = dayjs(startDate);
    const endOfCurrentPeriod = dayjs(endDate);
    const diff = endOfCurrentPeriod.diff(startOfCurrentPeriod, 'day');
    let startOfPreviousPeriod = startOfCurrentPeriod.subtract(diff, 'day');
    let endOfPreviousPeriod = endOfCurrentPeriod.subtract(diff, 'day');

    if (
      endOfCurrentPeriod.format('MM-DD-YYYY') ===
        dayjs().format('MM-DD-YYYY') &&
      startOfCurrentPeriod.format('MM-DD-YYYY') ===
        dayjs().startOf('year').format('MM-DD-YYYY')
    ) {
      startOfPreviousPeriod = dayjs().subtract(1, 'year').startOf('year');
      endOfPreviousPeriod = dayjs(new Date()).subtract(1, 'year');
    }

    return {
      startOfCurrentPeriod,
      endOfCurrentPeriod,
      startOfPreviousPeriod,
      endOfPreviousPeriod,
    };
  }

  calculatePercentChange(currentTotal, previousTotal) {
    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  getFilterByPeriod(startOfPeriod, endOfPeriod, organizationId) {
    const filterCurrent = {
      organizationId,
      createdAt: {
        $gte: startOfPeriod,
        $lte: endOfPeriod,
      },
    };

    return filterCurrent;
  }
}
