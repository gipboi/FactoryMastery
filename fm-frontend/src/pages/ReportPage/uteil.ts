import { EPeriod } from 'constants/report/period';
import dayjs from 'dayjs';
import { getTimeRangeByPeriod } from 'pages/CompanyReportPage';

export function getPeriodLabel(period: EPeriod): string {
	const { startTime, endTime } = getTimeRangeByPeriod(period);
	if (period === EPeriod.CUSTOM) {
		return `from ${dayjs(startTime).format('MM/DD/YYYY')} to ${dayjs(
			endTime
		).format('MM/DD/YYYY')}`;
	}
	return period;
}
