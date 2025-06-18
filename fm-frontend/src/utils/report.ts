import { EPeriod } from 'constants/report/period';
import { startCase } from 'lodash';

export function formatPeriod(period: EPeriod): string {
	const todayString = 'yesterday';
	const pastString = 'period before last';

	let periodString = '';

	if (period === EPeriod.DAY) {
		periodString = todayString;
	} else if (period.includes('this')) {
		periodString = period.replace('this', 'last');
	} else if (period.includes('last')) {
		const currentPeriod = period.split(' ')[1];
		periodString = pastString.replace('period', currentPeriod);
	} else {
		periodString = 'Custom period';
	}

	return `/${startCase(periodString)}`;
}

export function formatLastPeriod(period: EPeriod): string {
	const todayString = 'yesterday';
	const pastString = 'period before last';

	let periodString = '';

	if (period === EPeriod.DAY) {
		periodString = todayString;
	} else if (period.includes('this')) {
		periodString = period.replace('this', 'last');
	} else if (period.includes('last')) {
		const currentPeriod = period.split(' ')[1];
		periodString = pastString.replace('period', currentPeriod);
	} else {
		periodString = 'custom period';
	}

	return `${startCase(periodString)}`;
}
