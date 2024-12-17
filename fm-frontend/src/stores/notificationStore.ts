import {
  countNotifications,
  countNotificationsByAggregation,
  getNotifications,
  getNotificationsByAggregation,
  seenAllNotifications,
} from "API/notification";
import { INotificationWithRelations } from "interfaces/notification";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { IFilter } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";
import { getValidArray } from "utils/common";

class NotificationStore {
  rootStore: RootStore;

  isFetching: boolean = false;

  countNotifications: number = 0;
  countNotSeenNotifications: number = 0;
  countNotSeenNotificationBells: number = 0;

  countAllNotifications: number = 0;

  notificationFilter: IFilter<INotificationWithRelations> = {};

  notifications: INotificationWithRelations[] = [];
  notificationBells: INotificationWithRelations[] = [];

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  public setListFilter(filter: IFilter<INotificationWithRelations> = {}): void {
    this.notificationFilter = filter;
  }

  public async fetchNotifications(
    fetchNextPage = false,
    filter?: IFilter<INotificationWithRelations>
  ): Promise<void> {
    this.isFetching = true;
    const notifications = await getNotifications(
      filter ?? this.notificationFilter
    );
    if (fetchNextPage) {
      this.notifications = [...this.notifications, ...notifications];
    } else {
      this.notifications = notifications;
    }
    this.countNotifications = notifications?.length ?? 0;
    this.countNotSeenNotifications =
      getValidArray(notifications).filter(
        (notification) => !notification?.isSeen
      )?.length ?? 0;
    this.isFetching = false;
  }

  public async fetchNotificationBells(
    filter?: IFilter<INotificationWithRelations>
  ): Promise<void> {
    this.isFetching = true;
    const notifications = await getNotifications(
      filter ?? this.notificationFilter
    );

    this.notificationBells = notifications;
    this.countNotSeenNotificationBells =
      getValidArray(notifications).filter(
        (notification) => !notification?.isSeen
      )?.length ?? 0;
    this.isFetching = false;
  }

  public async seenAllNotifications(): Promise<void> {
    await seenAllNotifications();
    this.countNotifications = 0;
  }

  public async fetchNotificationByAggregation(
    pipeline: AggregationPipeline,
    countPipeline: AggregationPipeline
  ): Promise<void> {
    const [notifications, count] = await Promise.all([
      getNotificationsByAggregation(pipeline),
      countNotificationsByAggregation(countPipeline),
    ]);
    this.notifications = notifications;
    this.countNotifications = notifications?.length ?? 0;
    this.countNotSeenNotifications =
      getValidArray(notifications).filter(
        (notification) => !notification?.isSeen
      )?.length ?? 0;

    this.countAllNotifications = count
  }
}
export default NotificationStore;
