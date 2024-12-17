import { createAdditionalCrudService } from "API/additionalCrud";
import { createCrudService } from "API/crud";
import {
  INotification,
  INotificationWithRelations,
} from "interfaces/notification";
import { IFilter, IWhere } from "types/common";
import { AggregationPipeline } from "types/common/aggregation";

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

export async function countNotifications(
  where?: IWhere<INotification>
): Promise<number> {
  return notificationCrudService.count(where);
}

export async function seenAllNotifications(): Promise<void> {
  await notificationAdditionalCrudService.post("/seen-all", { isSeen: true });
}

export async function seenNotification(notificationId: string): Promise<void> {
  if (!notificationId) return;
  await notificationCrudService.update(notificationId, { isSeen: true });
}

export async function getNotificationsByAggregation(
  pipeline: AggregationPipeline
): Promise<INotificationWithRelations[]> {
  return notificationAdditionalCrudService.aggregate(
    pipeline
  ) as unknown as INotificationWithRelations[];
}

export async function countNotificationsByAggregation(
  pipeline: AggregationPipeline
): Promise<number> {
  const data = (await notificationAdditionalCrudService.aggregate(
    pipeline
  )) as { totalResults: number }[];

  return data?.[0]?.totalResults as number;
}
