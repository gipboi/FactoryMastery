import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupMessageThreadSchema = new Schema(
  {
    name: { type: String, require: true },
    isPrivate: { type: Boolean, default: false },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    lastMessageAt: { type: Date },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupMessageThreadSchema.virtual("organization", {
  ref: "Organization", 
  localField: "organizationId", 
  foreignField: "_id", 
});

groupMessageThreadSchema.virtual("groupMessages", {
  ref: "GroupMessage",
  localField: "_id",
  foreignField: "groupThreadId",
});

groupMessageThreadSchema.virtual("organization", {
  ref: "Organization",
  localField: "organizationId",
  foreignField: "_id",
});

groupMessageThreadSchema.virtual("groupMessageThreadUserSeens", {
  ref: "GroupMessageThreadUserSeen",
  localField: "_id",
  foreignField: "groupThreadId",
});

groupMessageThreadSchema.virtual("groupMessageThreadUsers", {
  ref: "GroupMessageThreadUser",
  localField: "_id",
  foreignField: "groupThreadId",
});

groupMessageThreadSchema.virtual("groups", {
  ref: "GroupMessageThreadGroup",
  localField: "_id",
  foreignField: "groupThreadId",
});

// Set Object and Json property to true. Default is set to false
groupMessageThreadSchema.set("toObject", { virtuals: true });
groupMessageThreadSchema.set("toJSON", { virtuals: true });

groupMessageThreadSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupMessageThread = mongoose.model("GroupMessageThread", groupMessageThreadSchema);

export default GroupMessageThread;
