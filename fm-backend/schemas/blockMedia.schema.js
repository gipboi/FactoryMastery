import mongoose from "mongoose";
const Schema = mongoose.Schema;

const blockMediaSchema = new Schema(
  {
    blockId: { type: Schema.Types.ObjectId, require: true },
    mediaId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

blockMediaSchema.virtual("block", {
  ref: "Block", //The Model to use
  localField: "blockId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

blockMediaSchema.virtual("media", {
  ref: "Media",
  localField: "mediaId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
blockMediaSchema.set("toObject", { virtuals: true });
blockMediaSchema.set("toJSON", { virtuals: true });

blockMediaSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const BlockMedia = mongoose.model("BlockMedia", blockMediaSchema);

export default BlockMedia;
