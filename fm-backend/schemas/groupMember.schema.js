import mongoose from "mongoose";
import { GroupMemberPermissionEnum } from "../constants/enums/user-group-permission.enum";
const Schema = mongoose.Schema;

const groupMemberSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, require: true },
    userId: { type: Schema.Types.ObjectId, require: true },
    permission: {
      type: String,
      enum: GroupMemberPermissionEnum,
      default: GroupMemberPermissionEnum.VIEWER,
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupMemberSchema.virtual("user", {
  ref: "User", //The Model to use
  localField: "userId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

groupMemberSchema.virtual("group", {
  ref: "Group", //The Model to use
  localField: "groupId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
groupMemberSchema.set("toObject", { virtuals: true });
groupMemberSchema.set("toJSON", { virtuals: true });

groupMemberSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

export default GroupMember;
