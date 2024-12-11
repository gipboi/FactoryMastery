import mongoose from "mongoose";
import { ProcessStatusEnum } from "../constants/enums/process-status.enum";
const Schema = mongoose.Schema;

const processSchema = new Schema(
  {
    name: { type: String, require: true },
    description: { type: String },
    owner: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    image: { type: String },
    totalTime: { type: String, default: "00:00:00" },
    status: {
      type: String,
      enum: ProcessStatusEnum,
      default: ProcessStatusEnum.ACTIVE,
    },
    reason: { type: String },
    publishedDate: { type: Date },
    rejectedDate: { type: Date },
    archivedAt: { type: Date },
    procedureType: { type: String },
    procedureIcon: { type: String },
    procedureIconColor: { type: String },
    isPublished: { type: Boolean, default: true },
    version: { type: String },
    releaseNote: { type: String },
    editorNote: { type: String },

    publishedById: { type: Schema.Types.ObjectId },
    rejectedById: { type: Schema.Types.ObjectId },
    documentTypeId: { type: Schema.Types.ObjectId },
    primaryGroupId: { type: Schema.Types.ObjectId },
    collectionId: { type: Schema.Types.ObjectId },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdBy: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

processSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

processSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
});

processSchema.virtual("publishedBy", {
  ref: "User",
  localField: "publishedById",
  foreignField: "_id",
});

processSchema.virtual("rejectedBy", {
  ref: "User",
  localField: "rejectedById",
  foreignField: "_id",
});

processSchema.virtual("group", {
  ref: "Group",
  localField: "primaryGroupId",
  foreignField: "_id",
});

processSchema.virtual("documentType", {
  ref: "DocumentType",
  localField: "documentTypeId",
  foreignField: "_id",
});

processSchema.virtual("steps", {
  ref: "Step",
  localField: "_id",
  foreignField: "processId",
  strictPopulate: false,
  sort: { position: 1 },
});

processSchema.virtual("userProcesses", {
  ref: "UserProcess",
  localField: "_id",
  foreignField: "processId",
  strictPopulate: false,
});

processSchema.virtual("groupProcesses", {
  ref: "GroupProcess",
  localField: "_id",
  foreignField: "processId",
  strictPopulate: false,
});

processSchema.virtual("groups", {
  ref: "GroupProcess",
  localField: "_id",
  foreignField: "processId",
  strictPopulate: false,
});

processSchema.virtual("tags", {
  ref: "ProcessTag",
  localField: "_id",
  foreignField: "processId",
  strictPopulate: false,
});

// processSchema.virtual("collection", {
//   ref: "Collection",
//   localField: "collectionId",
//   foreignField: "_id",
// });

// Set Object and Json property to true. Default is set to false
processSchema.set("toObject", { virtuals: true });
processSchema.set("toJSON", { virtuals: true });

processSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Process = mongoose.model("Process", processSchema);

export default Process;
