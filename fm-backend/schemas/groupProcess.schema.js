import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupProcessSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, require: true },
    processId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupProcessSchema.virtual("process", {
  ref: "Process", //The Model to use
  localField: "processId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

groupProcessSchema.virtual("group", {
  ref: "Group", //The Model to use
  localField: "groupId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
groupProcessSchema.set("toObject", { virtuals: true });
groupProcessSchema.set("toJSON", { virtuals: true });

groupProcessSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupProcess = mongoose.model("GroupProcess", groupProcessSchema);

export default GroupProcess;
