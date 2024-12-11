import { createAdditionalCrudService } from "API/additionalCrud";
import { createCrudService } from "API/crud";
import { INotification, INotificationWithRelations } from "interfaces/notification";
import { IFilter, IWhere } from "types/common";

const notificationCrudService = createCrudService<
  INotificationWithRelations,
  INotificationWithRelations
>("notifications");
const notificationAdditionalCrudService = createAdditionalCrudService<
  INotificationWithRelations,
  INotificationWithRelations
>("notifications");

export async function getNotifications(
  filter: IFilter<INotificationWithRelations> = {}
): Promise<INotificationWithRelations[]> {
  return notificationCrudService.get(filter);
}

export async function countNotifications(where?: IWhere<INotification>): Promise<number> {
  return notificationCrudService.count(where);
}

export async function seenAllNotifications(): Promise<void> {
  await notificationAdditionalCrudService.post("/seen-all", { isSeen: true });
}

export async function seenNotification(notificationId: string): Promise<void> {
  if (!notificationId) return;
  await notificationCrudService.update(notificationId, { isSeen: true });
}
