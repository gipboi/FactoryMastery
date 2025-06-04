import mongoose from "mongoose";
const Schema = mongoose.Schema;

const blockSchema = new Schema(
  {
    type: { type: String },
    content: { type: String },
    position: { type: Number },
    mediaTitle: { type: String },
    isDisableMediaLabel: { type: Boolean },
    mediaId: { type: Schema.Types.ObjectId },
    stepId: { type: Schema.Types.ObjectId, require: true },
    processId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    iconId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

blockSchema.virtual("process", {
  ref: "Process", //The Model to use
  localField: "processId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

blockSchema.virtual("step", {
  ref: "Step",
  localField: "stepId",
  foreignField: "_id",
});

blockSchema.virtual("media", {
  ref: "Media",
  localField: "mediaId",
  foreignField: "_id",
});

blockSchema.virtual("icon", {
  ref: "Icon",
  localField: "iconId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
blockSchema.set("toObject", { virtuals: true });
blockSchema.set("toJSON", { virtuals: true });

blockSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Block = mongoose.model("Block", blockSchema);

export default Block;
