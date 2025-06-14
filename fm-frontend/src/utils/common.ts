import { PriorityEnum } from 'constants/enums/thread';
import { LIMIT_PAGE_BREAK } from 'constants/pagination';
import { SupportMessageThreadStatus } from 'interfaces/message';

export function checkValidArray<T>(array?: T[]): boolean {
	return array ? Array.isArray(array) && array.length > 0 : false;
}

export function getValidArray<T>(array?: T[]): T[] {
	if (array === undefined) {
		return [];
	}
	return checkValidArray(array) ? array : [];
}
export function getValidDefaultArray<T>(array?: T[]): T[] {
	if (array === undefined) {
		return [];
	}
	return checkValidArray(array) ? array : [array as T];
}

export function getDefaultPageSize(): number {
	const pageSizeFromLocalStorage = localStorage.getItem('pageSize');
	const defaultPageLimit =
		pageSizeFromLocalStorage && !isNaN(Number(pageSizeFromLocalStorage))
			? Number(pageSizeFromLocalStorage)
			: LIMIT_PAGE_BREAK;
	return defaultPageLimit;
}

export function isEmail(email: string): boolean {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}

export function isValidEmail(email: string) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) || 'Enter valid email format';
}

export function generateMatchObjectIdsQuery(
	from: string,
	key: string,
	ids: string[]
) {
	return {
		$match: {
			$expr: {
				$anyElementTrue: {
					$map: {
						input: !from ? [`$${key}`] : `$${from}`,
						as: `${from}item`,
						in: {
							$in: [
								`$$${from}item` + `${!from ? '' : `.${key}`}`,
								getValidArray(ids).map((id) => ({ $toObjectId: id })),
							],
						},
					},
				},
			},
		},
	};
}

export function getThreadStatusColor(
	status: SupportMessageThreadStatus
): string {
	if (status === SupportMessageThreadStatus.UNCLAIMED) {
		return 'gray';
	}
	if (status === SupportMessageThreadStatus.CLAIMED) {
		return 'blue';
	}
	if (status === SupportMessageThreadStatus.RESOLVED) {
		return 'green';
	}
	if (status === SupportMessageThreadStatus.ALL) {
		return 'orange';
	}
	return '';
}

export function getPriorityConfig(priority?: PriorityEnum) {
	if (priority === undefined || priority === null) return null;

	switch (priority) {
		case PriorityEnum.URGENT:
			return {
				color: 'red.500',
				label: 'Urgent',
			};
		case PriorityEnum.HIGH:
			return {
				color: 'orange.400',
				label: 'High',
			};
		case PriorityEnum.NORMAL:
			return {
				color: 'blue.500',
				label: 'Normal',
			};
		case PriorityEnum.LOW:
			return {
				color: 'gray.400',
				label: 'Low',
			};
		default:
			return null;
	}
}
