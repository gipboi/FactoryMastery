import {
  countNotifications,
  getNotifications,
  seenAllNotifications,
} from "API/notification";
import { INotificationWithRelations } from "interfaces/notification";
import { makeAutoObservable } from "mobx";
import { RootStore } from "stores";
import { IFilter } from "types/common";
import { getValidArray } from "utils/common";

class NotificationStore {
  rootStore: RootStore;

  isFetching: boolean = false;

  countNotifications: number = 0;
  countNotSeenNotifications: number = 0;

  notificationFilter: IFilter<INotificationWithRelations> = {};

  notifications: INotificationWithRelations[] = [];

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  public setListFilter(filter: IFilter<INotificationWithRelations> = {}): void {
    this.notificationFilter = filter;
  }

  public async fetchNotifications(fetchNextPage = false): Promise<void> {
    this.isFetching = true;
    const notifications = await getNotifications(this.notificationFilter);
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

  public async aggregateCountNotifications(): Promise<void> {
    const notifications = await getNotifications(this.notificationFilter);

    this.countNotifications = notifications?.length ?? 0;
    this.countNotSeenNotifications =
      getValidArray(notifications).filter(
        (notification) => !notification?.isSeen
      )?.length ?? 0;
  }

  public async seenAllNotifications(): Promise<void> {
    await seenAllNotifications();
    this.countNotifications = 0;
  }
}
export default NotificationStore;
