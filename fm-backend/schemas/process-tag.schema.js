import mongoose from "mongoose";
const Schema = mongoose.Schema;

const processTagSchema = new Schema(
  {
    processId: { type: Schema.Types.ObjectId, require: true },
    tagId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

processTagSchema.virtual("process", {
  ref: "Process",
  localField: "processId",
  foreignField: "_id",
});

processTagSchema.virtual("tag", {
  ref: "Tag",
  localField: "tagId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
processTagSchema.set("toObject", { virtuals: true });
processTagSchema.set("toJSON", { virtuals: true });

processTagSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProcessTag = mongoose.model("ProcessTag", processTagSchema);

export default ProcessTag;
