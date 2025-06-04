import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: { type: String, require: true },
    description: String,
    isCompanyGroup: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    collectionId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

groupSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

groupSchema.virtual("collection", {
  ref: "Collection",
  localField: "collectionId",
  foreignField: "_id",
});

groupSchema.virtual("groupMembers", {
  ref: "GroupMember",
  localField: "_id",
  foreignField: "groupId",
});

// Set Object and Json property to true. Default is set to false
groupSchema.set("toObject", { virtuals: true });
groupSchema.set("toJSON", { virtuals: true });

groupSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
