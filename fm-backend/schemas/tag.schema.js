import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tagSchema = new Schema(
  {
    name: { type: String, require: true },
    organizationId: { type: Schema.Types.ObjectId, require: true },
    createdBy: { type: Schema.Types.ObjectId },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

tagSchema.virtual("organization", {
  ref: "Organization", //The Model to use
  localField: "organizationId", //Find in Model, where localField
  foreignField: "_id", // is equal to foreignField
});

tagSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
});

// Set Object and Json property to true. Default is set to false
tagSchema.set("toObject", { virtuals: true });
tagSchema.set("toJSON", { virtuals: true });

tagSchema.pre("validate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
