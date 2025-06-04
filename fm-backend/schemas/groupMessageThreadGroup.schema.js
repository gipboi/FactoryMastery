import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupMessageThreadGroupSchema = new Schema(
  {
    groupThreadId: { type: Schema.Types.ObjectId, require: true },
    groupId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupMessageThreadGroupSchema.virtual("groupThread", {
  ref: "GroupMessageThread",
  localField: "groupThreadId",
  foreignField: "_id",
});

groupMessageThreadGroupSchema.virtual("group", {
  ref: "Group",
  localField: "groupId",
  foreignField: "_id",
});

groupMessageThreadGroupSchema.set("toObject", { virtuals: true });
groupMessageThreadGroupSchema.set("toJSON", { virtuals: true });

groupMessageThreadGroupSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupMessageThreadGroup = mongoose.model("GroupMessageThreadGroup", groupMessageThreadGroupSchema);

export default GroupMessageThreadGroup;
