import mongoose from "mongoose";
import { NotificationTypeEnum } from "../constants/enums/notification.enum";
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    title: { type: String },
    reason: { type: String },
    type: {
      type: String,
      enum: NotificationTypeEnum,
    },
    deletedName: { type: String },
    subType: { type: String },
    rejectionReason: { type: String },
    description: { type: String },
    comment: { type: String },
    isSeen: { type: Boolean, default: false },

    reviewerId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, require: true },
    authorId: { type: Schema.Types.ObjectId },
    processWorkflowId: { type: Schema.Types.ObjectId },
    processId: { type: Schema.Types.ObjectId },
    stepId: { type: Schema.Types.ObjectId },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdBy: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

notificationSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

notificationSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
});

notificationSchema.virtual("reviewer", {
  ref: "User",
  localField: "reviewerId",
  foreignField: "_id",
});

notificationSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
});

notificationSchema.virtual("author", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
});

notificationSchema.virtual("processWorkflow", {
  ref: "Process",
  localField: "processWorkflowId",
  foreignField: "_id",
});

notificationSchema.virtual("process", {
  ref: "Process",
  localField: "processId",
  foreignField: "_id",
});

notificationSchema.virtual("step", {
  ref: "Step",
  localField: "stepId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
notificationSchema.set("toObject", { virtuals: true });
notificationSchema.set("toJSON", { virtuals: true });

notificationSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
