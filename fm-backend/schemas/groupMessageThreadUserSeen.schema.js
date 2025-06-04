import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupMessageThreadUserSeenSchema = new Schema(
  {
    lastSeenAt: { type: Date, require: true },
    userId: { type: Schema.Types.ObjectId, require: true },
    groupThreadId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupMessageThreadUserSeenSchema.virtual("groupThread", {
  ref: "GroupMessageThread",
  localField: "groupThreadId",
  foreignField: "_id",
});

groupMessageThreadUserSeenSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
});

groupMessageThreadUserSeenSchema.set("toObject", { virtuals: true });
groupMessageThreadUserSeenSchema.set("toJSON", { virtuals: true });

groupMessageThreadUserSeenSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupMessageThreadUserSeen = mongoose.model("GroupMessageThreadUserSeen", groupMessageThreadUserSeenSchema);

export default GroupMessageThreadUserSeen;
