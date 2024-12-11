import {
  NotificationActionEnum,
  NotificationTypeEnum,
} from "config/constant/enums/notification";

export function convertToNotificationActionDescription(
  notificationType: NotificationTypeEnum
): NotificationActionEnum | "" {
  const key = Object.entries(NotificationTypeEnum).find(
    (entry) => notificationType === entry[1]
  ) as [keyof typeof NotificationActionEnum, NotificationTypeEnum] | undefined;
  return key ? NotificationActionEnum[key[0]] : "";
}
