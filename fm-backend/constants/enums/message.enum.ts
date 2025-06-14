export enum SupportMessageThreadStatusEnum {
	ALL = 0,
	UNCLAIMED = 1,
	CLAIMED = 2,
	RESOLVED = 3,
}

export const SupportMessageThreadStatusValue = {
	0: 'All',
	1: 'Unclaimed',
	2: 'claimed',
	3: 'resolved',
};

export enum SupportMessageThreadPriorityEnum {
	URGENT = 'urgent',
	HIGH = 'high',
	NORMAL = 'normal',
	LOW = 'low',
}
