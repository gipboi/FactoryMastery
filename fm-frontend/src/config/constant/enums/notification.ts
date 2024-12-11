export enum NotificationTypeEnum {
  COMMENT_STEP_NOTIFICATION = "CommentStepNotification",
  UPDATED_STEP_NOTIFICATION = "UpdatedStepNotification",
  DELETED_STEP_NOTIFICATION = "DeletedStepNotification",
  UPDATED_PROCESS_NOTIFICATION = "UpdatedProcessNotification",
  DELETED_PROCESS_NOTIFICATION = "DeletedProcessNotification",
}

export enum NotificationActionEnum {
  WORKFLOW_NOTIFICATION = "has an update on",
  COMMENT_STEP_NOTIFICATION = "has a note on",
  QUIZ_NOTIFICATION = "has an update on",
  COURSE_NOTIFICATION = "has an update on",
}

export enum NotificationTitleEnum {
  UPDATED_PROCESS_NOTIFICATION = "is updated.",
  UPDATED_STEP_NOTIFICATION = "is updated.",
  DELETED_STEP_NOTIFICATION = "is deleted.",
  DELETED_PROCESS_NOTIFICATION = "is deleted.",
  UPDATED_CONFIRM_NOTIFICATION = "to apply changes on affected processes.",
}
