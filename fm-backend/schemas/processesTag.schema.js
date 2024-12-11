import mongoose from "mongoose";
const Schema = mongoose.Schema;

const processesTagSchema = new Schema(
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

processesTagSchema.virtual("process", {
  ref: "Process", //The Model to use
  localField: "processId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

processesTagSchema.virtual("tag", {
  ref: "Tag",
  localField: "tagId",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
processesTagSchema.set("toObject", { virtuals: true });
processesTagSchema.set("toJSON", { virtuals: true });

processesTagSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProcessesTag = mongoose.model("ProcessesTag", processesTagSchema);

export default ProcessesTag;
