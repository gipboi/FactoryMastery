/* eslint-disable max-lines */
import {
	getCountGroupMessageThreads,
	getGeneralMessageThreads,
	getGroupMessageThreads,
	getMessages,
} from 'API/messages';
import {
	countAllUnreadSupportThread,
	getCountSupportMessageThreads,
	getSupportMessageAggregate,
	getSupportMessages,
	getSupportMessageThreadStatusHistory,
	getSupportThread,
	markSupportMessageThreadAsSeen,
} from 'API/messages/support-message';
import escapeRegExp from 'lodash/escapeRegExp';
import trim from 'lodash/trim';
import { makeAutoObservable } from 'mobx';
import { RootStore } from 'stores';
import { AggregationPipeline } from 'types/common/aggregation';
// import { getStepsByAggregate } from 'API/step'
import { AuthRoleNameEnum } from 'constants/user';
import {
	IGroupMessages,
	IMessageGroup,
	IMessageGroupThreads,
	ISupportMessage,
	ISupportMessageThread,
	ISupportMessageThreadStatusHistory,
	ISupportThreadDto,
	IThreadGroup,
	SupportMessageThreadStatus,
} from 'interfaces/message';
import { IStepWithRelations } from 'interfaces/step';
import { IUserWithRelations } from 'interfaces/user';
import {
	ESupportThreadSortBy,
	ISupportThreadFilter,
	ProcessPublishStatus,
} from 'pages/SupportInboxPage/constants';
import { getValidArray } from 'utils/common';
import { getSupportMessageThread } from 'utils/message.query';
import {
	arrayUnion,
	collection,
	doc,
	query,
	updateDoc,
	where,
	getDocs,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from 'config/firebase';
import { IPriority } from 'components/PrioritySelector/constants';

export default class MessageStore {
	rootStore: RootStore;

	// INFO: general message
	unreadGroupThreadCount: number = 0;
	messageGroupThreads: IMessageGroup[] = [];
	totalThreadCount: number = 0;
	isLoading: boolean = false;
	generalMessages: IGroupMessages[] = [];
	currentThreadId: string = '';
	generalMessagePage: number = 1;
	generaltMessageKeyword: string = '';

	unreadGeneralThreadCount: number = 0;
	generalMessageThreads: IMessageGroupThreads[] = [];
	currentGeneralThreadId: string = '';

	// INFO: support message
	unreadSupportThreadCount: number = 0;
	supportThreads: ISupportThreadDto[] = [];
	totalSupportThreadCount: number = 0;
	supportMessages: ISupportMessage[] = [];
	currentSupportThreadId: string = '';
	selectedSupportThread: ISupportMessageThread = {} as ISupportMessageThread;
	stepOptions: IStepWithRelations[] = [];
	statusHistory: ISupportMessageThreadStatusHistory[] = [];
	supportThreadFilter: ISupportThreadFilter = {
		sort: ESupportThreadSortBy.UNCLAIMED_FIRST,
		status: SupportMessageThreadStatus.ALL,
		publish: ProcessPublishStatus.ALL,
	};
	supportMessagePage: number = 1;
	supportMessageKeyword: string = '';

	sort: ESupportThreadSortBy = ESupportThreadSortBy.UNCLAIMED_FIRST;
	isUnclaimed: boolean = false;
	isClaimedByMe: boolean = false;
	isClaimedByOthers: boolean = false;
	isResolved: boolean = false;
	statusList: SupportMessageThreadStatus[] = [];
	publish: ProcessPublishStatus = ProcessPublishStatus.ALL;
	isPublished: boolean = false;
	isDraft: boolean = false;
	includeParticipants: IUserWithRelations[] = [];
	modifiedDate: Date[] = [];
  priority: IPriority | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	mockGeneralMessages(data: any[]) {
		this.generalMessages = data;
	}

	mockSupportThreads(data: ISupportThreadDto[]) {
		this.supportThreads = data;
	}

	public setGeneralMessages(generalMessages: IGroupMessages[]) {
		this.generalMessages = generalMessages;
	}

	public async setCurrentGeneralThreadId(
		threadId: string,
		messageId: string,
		userId: string
	): Promise<void> {
		this.currentGeneralThreadId = threadId;

		// Mark thread as seen when selected
		if (messageId && userId) {
			this.markGeneralThreadAsSeen(threadId, messageId, userId);
		}
	}

	async markGeneralThreadAsSeen(
		threadId: string,
		messageId: string,
		userId: string
	) {
		try {
			const messageRef = doc(db, 'messages', messageId);
			const threadRef = doc(db, 'groupMessageThreads', threadId);

			// *INFO: Trigger update thread
			await Promise.all([
				updateDoc(messageRef, {
					seenBy: arrayUnion(userId),
				}),
				updateDoc(threadRef, {
					updatedAt: serverTimestamp(),
				}),
			]);
		} catch (error) {
			console.error('Error marking thread as seen:', error);
		}
	}

	public async getGroupMessageThreads(
		organizationId: string = '',
		offset: number,
		limit: number,
		keyword?: string
	): Promise<void> {
		this.isLoading = true;
		this.messageGroupThreads = await getGroupMessageThreads({
			order: ['lastMessageAt DESC'],
			offset,
			where: {
				organizationId,
				name: {
					like: `.*${escapeRegExp(trim(keyword))}.*`,
					options: 'i',
				},
			},
			limit,
			include: [
				{
					relation: 'groups',
					scope: {
						fields: ['name'],
						order: ['name ASC'],
					},
				},
				{
					relation: 'groupMessages',
					scope: {
						order: 'createdAt ASC',
						include: [
							{
								relation: 'user',
							},
						],
					},
				},
			],
		});
		this.isLoading = false;
	}

	public async getCountGroupMessageThreads(keyword = ''): Promise<void> {
		const organizationId =
			this.rootStore?.organizationStore?.organization?.id ?? '';
		const countResult = await getCountGroupMessageThreads({
			organizationId,
			name: {
				like: `.*${escapeRegExp(trim(keyword))}.*`,
				options: 'i',
			},
		});
		this.totalThreadCount = +countResult;
	}

	public async getUnreadThread(): Promise<void> {
		const pipeline = getSupportMessageThread(
			this.rootStore.authStore.userDetail?.organizationId,
			undefined,
			undefined,
			undefined,
			'',
			10,
			this.rootStore.authStore.userDetail?.id ?? '',
			this?.rootStore.authStore.userDetail?.authRole ===
				AuthRoleNameEnum.BASIC_USER &&
				!this?.rootStore?.authStore?.userDetail?.isMessageFullAccess,
			this.isUnclaimed,
			this.isClaimedByMe,
			this.isClaimedByOthers,
			this.isResolved,
			this.includeParticipants,
      this.priority,
		);
		this.unreadSupportThreadCount = +(await countAllUnreadSupportThread(
			pipeline
		));
		this.unreadSupportThreadCount = 2;
	}

	setGeneralMessageThreads(threads: IMessageGroupThreads[]) {
		this.generalMessageThreads = threads;
	}

	public async setCurrentThreadId(threadId: string): Promise<void> {
		this.currentThreadId = threadId;
	}

	public async getMessages() {
		this.messageGroupThreads = this.messageGroupThreads.map((groupThread) => {
			if (groupThread?.thread.id === this.currentGeneralThreadId) {
				groupThread.isSeen = true;
				return groupThread;
			}
			return groupThread;
		});

		const filter = {
			order: 'createdAt ASC',
			include: [
				{
					relation: 'groupMessages',
					scope: { include: [{ relation: 'user' }, { relation: 'receiver' }] },
				},
			],
		};
		this.generalMessages = await getMessages(
			this.currentGeneralThreadId,
			filter
		);
	}

	// INFO: Support message
	public async getSupportMessageThreads(
		organizationId: string,
		limit: number,
		isFetchFirstThread = false
	): Promise<void> {
		const pipeline = getSupportMessageThread(
			organizationId,
			this.sort,
			this.statusList,
			this.publish,
			this.supportMessageKeyword,
			limit,
			this?.rootStore?.authStore?.userDetail?.id ?? '',
			this?.rootStore?.authStore?.userDetail?.authRole ===
				AuthRoleNameEnum.BASIC_USER &&
				!this?.rootStore?.authStore?.userDetail?.isMessageFullAccess,
			this.isUnclaimed,
			this.isClaimedByMe,
			this.isClaimedByOthers,
			this.isResolved,
			this.includeParticipants,
      this.priority,
		);
		const [startDate, endDate] = this.modifiedDate;
		this.supportThreads = await getSupportMessageAggregate(
			pipeline,
			startDate,
			endDate
		);

		if (
			!this.currentSupportThreadId &&
			this.supportThreads?.length > 0 &&
			isFetchFirstThread
		) {
			this.currentSupportThreadId = this.supportThreads[0]?.thread?.id;
		}
	}

	public async getTotalSupportMessageThreads(
		organizationId: string
	): Promise<void> {
		const pipeline = getSupportMessageThread(
			organizationId,
			this.sort,
			this.statusList,
			this.publish,
			this.supportMessageKeyword,
			0,
			this?.rootStore?.authStore?.userDetail?.id ?? '',
			this?.rootStore?.authStore?.userDetail?.authRole ===
				AuthRoleNameEnum.BASIC_USER &&
				!this?.rootStore?.authStore?.userDetail?.isMessageFullAccess,
			this.isUnclaimed,
			this.isClaimedByMe,
			this.isClaimedByOthers,
			this.isResolved,
			this.includeParticipants,
      this.priority,
			true
		);

		const [startDate, endDate] = this.modifiedDate;
		const supportThreads = await getSupportMessageAggregate(
			pipeline,
			startDate,
			endDate
		);
		this.totalSupportThreadCount = getValidArray(supportThreads).length;
	}

	public async getTotalMessageThreads(
		organizationId: string,
		userId: string
	): Promise<void> {
		const groupMessageThreadQuery = query(
			collection(db, 'groupMessageThreads'),
			where('organizationId', '==', organizationId),
			where('memberId', 'array-contains', userId)
		);
    
		const snapshot = await getCountFromServer(groupMessageThreadQuery);
		this.totalThreadCount = snapshot.data().count
	}

	public async getTotalSupportThreads(
		organizationId: string,
		keyword: string
	): Promise<void> {
		const where = {
			organizationId,
			name: {
				like: `.*${keyword}.*`,
				options: 'i',
			},
			status:
				Number(this.supportThreadFilter.status) === 0
					? undefined
					: this.supportThreadFilter.status,
		};
		this.totalSupportThreadCount = +(await getCountSupportMessageThreads(
			where
		));
	}

	public async setCurrentSupportThreadId(threadId: string): Promise<void> {
		this.currentSupportThreadId = threadId;

		if (threadId) {
			this.markSupportMessageThreadAsSeen(threadId);
		}
	}

	async markSupportMessageThreadAsSeen(threadId: string) {
		try {
			await markSupportMessageThreadAsSeen(threadId);
		} catch (error) {
			console.error('Error marking thread as seen:', error);
		}
	}

	public async resetSelectedThread(): Promise<void> {
		this.currentSupportThreadId = '';
		this.selectedSupportThread = {} as ISupportMessageThread;
	}

	public async getStepOptions(pipeline: AggregationPipeline): Promise<void> {
		// this.stepOptions = await getStepsByAggregate(pipeline);
	}

	public async setSupportThreadFilter(
		status: SupportMessageThreadStatus,
		publish: ProcessPublishStatus
	): Promise<void> {
		// INFO: Open later
		this.supportThreadFilter = { sort: this.sort, status, publish };
	}

	public async getSupportMessages() {
		if (!this.currentSupportThreadId) {
			return;
		}
		this.supportThreads = this.supportThreads.map((supportThread) => {
			if (supportThread?.thread.id === this.currentSupportThreadId) {
				supportThread.isSeen = true;
				return supportThread;
			}
			return supportThread;
		});
		const filter = {
			order: 'createdAt ASC',
			include: [
				{
					relation: 'user',
				},
			],
		};
		this.supportMessages = await getSupportMessages(
			this.currentSupportThreadId,
			filter
		);
	}

	public async getThreadDetail() {
		const filter = {
			include: [
				{
					relation: 'users',
				},
				{
					relation: 'step',
					scope: {
						include: [
							{
								relation: 'process',
							},
							{
								relation: 'icon',
							},
						],
					},
				},
				{
					relation: 'process',
					scope: {
						include: [
							{
								relation: 'documentType',
								scope: {
									include: [
										{
											relation: 'icon',
										},
									],
								},
							},
						],
					},
				},
			],
		};
		if (this.currentSupportThreadId) {
			this.selectedSupportThread = await getSupportThread(
				this.currentSupportThreadId,
				filter
			);
		}
	}

	public async getStatusHistory(threadId: string): Promise<void> {
		this.statusHistory = await getSupportMessageThreadStatusHistory(threadId);
	}

	public changeSortBy(sortBy: string) {
		this.sort = sortBy as ESupportThreadSortBy;
	}

	public changeStatus() {
		if (
			this.isUnclaimed &&
			!this.statusList.includes(SupportMessageThreadStatus.UNCLAIMED)
		) {
			this.statusList.push(SupportMessageThreadStatus.UNCLAIMED);
		}
		if (
			!this.isUnclaimed &&
			this.statusList.includes(SupportMessageThreadStatus.UNCLAIMED)
		) {
			this.statusList = this.statusList.filter(
				(status) => status !== SupportMessageThreadStatus.UNCLAIMED
			);
		}
		if (
			this.isResolved &&
			!this.statusList.includes(SupportMessageThreadStatus.RESOLVED)
		) {
			this.statusList.push(SupportMessageThreadStatus.RESOLVED);
		}
		if (
			!this.isResolved &&
			this.statusList.includes(SupportMessageThreadStatus.RESOLVED)
		) {
			this.statusList = this.statusList.filter(
				(status) => status !== SupportMessageThreadStatus.RESOLVED
			);
		}
	}

	public changeProcessType() {
		if (this.isPublished && !this.isDraft) {
			this.publish = ProcessPublishStatus.PUBLISHED;
		} else if (!this.isPublished && this.isDraft) {
			this.publish = ProcessPublishStatus.DRAFT;
		} else {
			this.publish = ProcessPublishStatus.ALL;
		}
	}

	public setIsUnclaimed(isUnclaimed: boolean) {
		this.isUnclaimed = isUnclaimed;
	}

	public setIsClaimedByMe(isClaimedByMe: boolean) {
		this.isClaimedByMe = isClaimedByMe;
	}

	public setIsClaimedByOthers(isClaimedByOthers: boolean) {
		this.isClaimedByOthers = isClaimedByOthers;
	}

	public setIsResolved(isResolved: boolean) {
		this.isResolved = isResolved;
	}

	public setIsPublished(isPublished: boolean) {
		this.isPublished = isPublished;
	}

	public setIsDraft(isDraft: boolean) {
		this.isDraft = isDraft;
	}

	public setPriority(priority: IPriority | null) {
		this.priority = priority;
	}

	public setIncludeParticipants(participants: IUserWithRelations[]) {
		this.includeParticipants = participants;
	}

	public setModifiedDate(modifiedDate: Date[]) {
		this.modifiedDate = modifiedDate;
	}

	public updateUnreadGroupThread() {
		this.unreadGroupThreadCount -= 1;
	}

	public updateUnreadSupportThread() {
		this.unreadSupportThreadCount -= 1;
	}

	public updateSupportMessagePage(page: number) {
		this.supportMessagePage = page;
	}

	public updateGeneralMessagePage(page: number) {
		this.generalMessagePage = page;
	}

	public updateGeneralMessageKeyword(keyword: string) {
		this.generaltMessageKeyword = keyword;
	}

	public updateSupportMessageKeyword(keyword: string) {
		this.supportMessageKeyword = keyword;
	}
}
