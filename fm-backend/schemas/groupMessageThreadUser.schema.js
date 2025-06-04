import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupMessageThreadUserSchema = new Schema(
  {
    groupThreadId: { type: Schema.Types.ObjectId, require: true },
    userId: { type: Schema.Types.ObjectId, require: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupMessageThreadUserSchema.virtual("groupThread", {
  ref: "GroupMessageThread",
  localField: "groupThreadId",
  foreignField: "_id",
});

groupMessageThreadUserSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
});

groupMessageThreadUserSchema.set("toObject", { virtuals: true });
groupMessageThreadUserSchema.set("toJSON", { virtuals: true });

groupMessageThreadUserSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupMessageThreadUser = mongoose.model("GroupMessageThreadUser", groupMessageThreadUserSchema);

export default GroupMessageThreadUser;
